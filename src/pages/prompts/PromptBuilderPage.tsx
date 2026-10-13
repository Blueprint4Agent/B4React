import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCheck,
    Copy,
    Download,
    Layers3,
    Plus,
    RotateCcw,
    FilePenLine,
    Server,
    PanelsTopLeft,
    Paintbrush,
    Database,
    ShieldCheck,
    Radio,
    Workflow,
    Upload,
    CreditCard,
    TestTube2,
    CloudUpload,
    Cable,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { MainPageTemplate } from "../../components/layout/MainPageTemplate";
import {
    Button,
    InputField,
    FormCheckbox,
    DropdownMenu,
    InlineMessage,
    Modal,
    SelectionCard,
    TextareaField,
} from "../../components/ui";
import { useToast } from "../../hooks/useToast";
import {
    answerFor,
    buildPrompt,
    emptyDraft,
    missingQuestions,
    questionsFor,
    type PromptDraft,
    type PromptMode,
    type PromptScope,
    isAnswered,
    ROLES,
    ACTIONS,
    type Capability,
    type Role,
    type Permission,
} from "./promptBuilder";

type Screen = "welcome" | "choose" | "question" | "review" | "result";
const SCOPE_ICONS: Record<string, typeof Server> = {
    backend: Server,
    frontend: PanelsTopLeft,
    ui: Paintbrush,
    api: Cable,
    database: Database,
    auth: ShieldCheck,
    realtime: Radio,
    background: Workflow,
    storage: Upload,
    billing: CreditCard,
    tests: TestTube2,
    deployment: CloudUpload,
};
const GROUPS = ["title", "scope", "capabilities", "finish"] as const;
export function PromptBuilderPage() {
    const { t } = useTranslation();
    const toast = useToast();
    const [screen, setScreen] = useState<Screen>("welcome");
    const [mode, setMode] = useState<PromptMode>("feature");
    const [drafts, setDrafts] = useState<Record<PromptMode, PromptDraft>>(() => ({
        feature: emptyDraft(),
        project: emptyDraft(),
    }));
    const [index, setIndex] = useState(0);
    const [editing, setEditing] = useState(false);
    const [copyError, setCopyError] = useState(false);
    const [copying, setCopying] = useState(false);
    const [resetOpen, setResetOpen] = useState(false);
    const heading = useRef<HTMLHeadingElement>(null);
    const draft = drafts[mode];
    const questions = questionsFor(mode, draft);
    const question = questions[index];
    const prompt = useMemo(() => buildPrompt(mode, draft, t), [mode, draft, t]);
    const screenKey = `${screen}-${screen === "question" ? question.id : mode}`;
    useEffect(() => {
        heading.current?.focus();
    }, [screenKey]);
    const patchDraft = (patch: Partial<PromptDraft>) =>
        setDrafts((current) => ({ ...current, [mode]: { ...current[mode], ...patch } }));
    const update = (value: string) => {
        if (question.id === "scope")
            patchDraft({
                scope: draft.scope.includes(value as PromptScope)
                    ? draft.scope.filter((item) => item !== value)
                    : [...draft.scope, value as PromptScope],
            });
        else if (question.id === "capabilities")
            patchDraft({
                capabilities: draft.capabilities.includes(value as Capability)
                    ? draft.capabilities.filter((item) => item !== value)
                    : [...draft.capabilities, value as Capability],
            });
        else if (question.id === "finish") patchDraft({ finish: value as PromptDraft["finish"] });
        else patchDraft({ title: value });
    };
    const updatePermission = (role: Role, permission: Permission) =>
        patchDraft({ permissions: { ...draft.permissions, [role]: permission } });
    const openQuestion = (next: number) => {
        setIndex(next);
        setScreen("question");
    };
    const next = () => {
        if (editing || index === questions.length - 1) {
            setEditing(false);
            setScreen("review");
        } else openQuestion(index + 1);
    };
    const copy = async () => {
        setCopying(true);
        setCopyError(false);
        try {
            await navigator.clipboard.writeText(prompt);
            toast(t("promptBuilder.copied"));
        } catch {
            setCopyError(true);
        } finally {
            setCopying(false);
        }
    };
    const download = () => {
        const url = URL.createObjectURL(
            new Blob([prompt], { type: "text/markdown;charset=utf-8" }),
        );
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `blueprint-${mode}-prompt.md`;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast(t("promptBuilder.downloaded"));
    };
    return (
        <MainPageTemplate
            title={t("promptBuilder.title")}
            menuLabel={t("promptBuilder.title")}
            menuItems={[]}
        >
            <div className="prompt-builder">
                <div className="prompt-ambient" aria-hidden="true" />
                {!["welcome", "choose"].includes(screen) && (
                    <nav className="prompt-progress" aria-label={t("promptBuilder.progress")}>
                        {GROUPS.map((group, groupIndex) => {
                            const active =
                                screen === "question" ? GROUPS.indexOf(question.group) : 4;
                            return (
                                <span
                                    key={group}
                                    className={`prompt-progress__step${groupIndex <= active ? " is-reached" : ""}`}
                                    aria-current={groupIndex === active ? "step" : undefined}
                                >
                                    <span>
                                        {groupIndex < active ? (
                                            <Check size={12} aria-hidden="true" />
                                        ) : (
                                            groupIndex + 1
                                        )}
                                    </span>
                                    <span>{t(`promptBuilder.groups.${group}`)}</span>
                                </span>
                            );
                        })}
                    </nav>
                )}
                <div key={screenKey} className={`prompt-scene prompt-scene--${screen}`}>
                    {screen === "welcome" && (
                        <div className="prompt-welcome">
                            <h2 ref={heading} tabIndex={-1}>
                                {t("promptBuilder.welcomeTitle")}
                            </h2>
                            <Button
                                appearance="pill"
                                className="prompt-start"
                                onClick={() => setScreen("choose")}
                            >
                                {t("promptBuilder.start")}
                                <ArrowRight size={18} aria-hidden="true" />
                            </Button>
                        </div>
                    )}
                    {screen === "choose" && (
                        <>
                            <div className="prompt-intro">
                                <h2 ref={heading} tabIndex={-1}>
                                    {t("promptBuilder.chooseTitle")}
                                </h2>
                            </div>
                            <div
                                className="prompt-choices"
                                role="group"
                                aria-label={t("promptBuilder.chooseTitle")}
                            >
                                {(["feature", "project"] as const).map((value) => {
                                    const Icon = value === "feature" ? Plus : Layers3;
                                    return (
                                        <Button
                                            key={value}
                                            className="prompt-path-card"
                                            onClick={() => {
                                                setMode(value);
                                                setEditing(false);
                                                openQuestion(0);
                                            }}
                                        >
                                            <span className="prompt-path-card__icon">
                                                <Icon size={24} aria-hidden="true" />
                                            </span>
                                            <strong>
                                                {t(`promptBuilder.modes.${value}.title`)}
                                            </strong>
                                            <span className="prompt-path-card__footer">
                                                {t(`promptBuilder.modes.${value}.example`)}
                                                <ArrowRight size={18} aria-hidden="true" />
                                            </span>
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                appearance="pill-secondary"
                                onClick={() => setScreen("welcome")}
                            >
                                <ArrowLeft size={15} aria-hidden="true" />
                                {t("promptBuilder.back")}
                            </Button>
                        </>
                    )}
                    {screen === "question" && (
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                if (!question.required || isAnswered(question, draft)) next();
                            }}
                        >
                            <div className="prompt-question-meta">
                                <span>
                                    {t(`promptBuilder.modes.${mode}.title`)}{" "}
                                    <span className="prompt-requirement">
                                        {t(
                                            question.required
                                                ? "promptBuilder.required"
                                                : "promptBuilder.optional",
                                        )}
                                    </span>
                                </span>
                                <span>
                                    {String(index + 1).padStart(2, "0")} / {questions.length}
                                </span>
                            </div>
                            <h2 ref={heading} tabIndex={-1}>
                                {t(`promptBuilder.fields.${question.id}.question`)}
                            </h2>
                            {question.options ? (
                                <div
                                    className={`prompt-options${question.id === "scope" ? " prompt-options--scope" : question.id === "capabilities" ? " prompt-options--capabilities" : ""}`}
                                    role="group"
                                    aria-label={t(`promptBuilder.fields.${question.id}.label`)}
                                >
                                    {question.options.map((option, optionIndex) => {
                                        const Icon = SCOPE_ICONS[option];
                                        const selected =
                                            question.id === "scope"
                                                ? draft.scope.includes(option as PromptScope)
                                                : question.id === "capabilities"
                                                  ? draft.capabilities.includes(
                                                        option as Capability,
                                                    )
                                                  : draft[question.id] === option;
                                        return (
                                            <Fragment key={option}>
                                                {question.id === "scope" &&
                                                    (optionIndex === 0 || optionIndex === 3) && (
                                                        <p className="prompt-scope-label">
                                                            {t(
                                                                optionIndex === 0
                                                                    ? "promptBuilder.scopeAreas"
                                                                    : "promptBuilder.scopeElements",
                                                            )}
                                                        </p>
                                                    )}
                                                <SelectionCard
                                                    key={option}
                                                    selected={selected}
                                                    onClick={() => update(option)}
                                                >
                                                    {question.id === "scope" && Icon && (
                                                        <Icon size={22} aria-hidden="true" />
                                                    )}
                                                    <span>
                                                        {t(
                                                            `promptBuilder.options.${question.id}.${option}`,
                                                        )}
                                                    </span>
                                                    {selected && (
                                                        <Check
                                                            className="prompt-option-check"
                                                            size={16}
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                </SelectionCard>
                                            </Fragment>
                                        );
                                    })}
                                </div>
                            ) : (
                                <InputField
                                    label={t("promptBuilder.fields.title.label")}
                                    value={draft.title}
                                    onValueChange={update}
                                    placeholder={t("promptBuilder.fields.title.placeholder")}
                                    maxLength={100}
                                    required
                                />
                            )}
                            {question.id === "capabilities" && (
                                <>
                                    <div className="prompt-rbac-heading">
                                        <h3>{t("promptBuilder.rbac.title")}</h3>
                                        <span>{t("promptBuilder.rbac.defaults")}</span>
                                    </div>
                                    <div className="prompt-permissions">
                                        <table>
                                            <caption className="sr-only">
                                                {t("promptBuilder.rbac.title")}
                                            </caption>
                                            <thead>
                                                <tr>
                                                    <th scope="col">
                                                        {t("promptBuilder.rbac.role")}
                                                    </th>
                                                    {ACTIONS.map((action) => (
                                                        <th scope="col" key={action}>
                                                            {t(
                                                                `promptBuilder.rbac.actions.${action}`,
                                                            )}
                                                        </th>
                                                    ))}
                                                    <th scope="col">
                                                        {t("promptBuilder.rbac.data")}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ROLES.map((role) => (
                                                    <tr key={role}>
                                                        <th scope="row">
                                                            {t(`promptBuilder.rbac.roles.${role}`)}
                                                        </th>
                                                        {ACTIONS.map((action) => (
                                                            <td key={action}>
                                                                <FormCheckbox
                                                                    hideLabel
                                                                    checked={draft.permissions[
                                                                        role
                                                                    ].actions.includes(action)}
                                                                    label={`${t(`promptBuilder.rbac.roles.${role}`)} ${t(`promptBuilder.rbac.actions.${action}`)}`}
                                                                    onCheckedChange={(checked) =>
                                                                        updatePermission(role, {
                                                                            ...draft.permissions[
                                                                                role
                                                                            ],
                                                                            actions: checked
                                                                                ? [
                                                                                      ...draft
                                                                                          .permissions[
                                                                                          role
                                                                                      ].actions,
                                                                                      action,
                                                                                  ]
                                                                                : draft.permissions[
                                                                                      role
                                                                                  ].actions.filter(
                                                                                      (item) =>
                                                                                          item !==
                                                                                          action,
                                                                                  ),
                                                                        })
                                                                    }
                                                                />
                                                            </td>
                                                        ))}
                                                        <td>
                                                            {role === "guest" ? (
                                                                <span>
                                                                    {t("promptBuilder.rbac.public")}
                                                                </span>
                                                            ) : (
                                                                <DropdownMenu
                                                                    floating
                                                                    disabled={
                                                                        !draft.permissions[role]
                                                                            .actions.length
                                                                    }
                                                                    label={t(
                                                                        "promptBuilder.rbac.dataFor",
                                                                        {
                                                                            role: t(
                                                                                `promptBuilder.rbac.roles.${role}`,
                                                                            ),
                                                                        },
                                                                    )}
                                                                    triggerLabel={t(
                                                                        `promptBuilder.rbac.ownership.${draft.permissions[role].ownership}`,
                                                                    )}
                                                                    items={["own", "all"].map(
                                                                        (value) => ({
                                                                            id: value,
                                                                            label: t(
                                                                                `promptBuilder.rbac.ownership.${value}`,
                                                                            ),
                                                                        }),
                                                                    )}
                                                                    onSelect={(value) =>
                                                                        updatePermission(role, {
                                                                            ...draft.permissions[
                                                                                role
                                                                            ],
                                                                            ownership:
                                                                                value as Permission["ownership"],
                                                                        })
                                                                    }
                                                                />
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <TextareaField
                                        label={t("promptBuilder.notes")}
                                        value={draft.notes}
                                        onValueChange={(notes) => patchDraft({ notes })}
                                        placeholder={t("promptBuilder.notesPlaceholder")}
                                        rows={2}
                                        maxLength={1000}
                                    />
                                </>
                            )}
                            {question.id === "finish" && draft.finish === "deploy" && (
                                <InputField
                                    label={t("promptBuilder.deployment")}
                                    value={draft.deployment}
                                    onValueChange={(deployment) => patchDraft({ deployment })}
                                    placeholder={t("promptBuilder.deploymentPlaceholder")}
                                    maxLength={500}
                                    required
                                />
                            )}
                            <div className="prompt-actions">
                                <Button
                                    appearance="pill-secondary"
                                    onClick={() => {
                                        if (editing) {
                                            setEditing(false);
                                            setScreen("review");
                                        } else if (index === 0) setScreen("choose");
                                        else openQuestion(index - 1);
                                    }}
                                >
                                    <ArrowLeft size={16} aria-hidden="true" />
                                    {t("promptBuilder.back")}
                                </Button>
                                <div className="prompt-forward-actions">
                                    {!question.required && (
                                        <Button appearance="pill-secondary" onClick={next}>
                                            {t("promptBuilder.skip")}
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        appearance="pill"
                                        disabled={Boolean(
                                            question.required && !isAnswered(question, draft),
                                        )}
                                    >
                                        {t(
                                            editing
                                                ? "promptBuilder.saveAnswer"
                                                : index === questions.length - 1
                                                  ? "promptBuilder.review"
                                                  : "promptBuilder.next",
                                        )}
                                        <ArrowRight size={16} aria-hidden="true" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                    {screen === "review" && (
                        <>
                            <div className="prompt-intro">
                                <h2 ref={heading} tabIndex={-1}>
                                    {t("promptBuilder.reviewTitle")}
                                </h2>
                            </div>
                            <div className="prompt-review">
                                {questions.map((q, questionIndex) => (
                                    <div className="prompt-review__row" key={q.id}>
                                        <div>
                                            <span className="prompt-review__label">
                                                {t(`promptBuilder.fields.${q.id}.label`)}
                                                {!isAnswered(q, draft) && (
                                                    <span className="prompt-default">
                                                        {t(
                                                            q.required
                                                                ? "promptBuilder.missing"
                                                                : "promptBuilder.suggested",
                                                        )}
                                                    </span>
                                                )}
                                            </span>
                                            <p>{answerFor(q, draft, t)}</p>
                                        </div>
                                        <Button
                                            appearance="pill-secondary"
                                            onClick={() => {
                                                setEditing(true);
                                                openQuestion(questionIndex);
                                            }}
                                            aria-label={t("promptBuilder.editField", {
                                                field: t(`promptBuilder.fields.${q.id}.label`),
                                            })}
                                        >
                                            {t("promptBuilder.edit")}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            {missingQuestions(mode, draft).length > 0 && (
                                <InlineMessage tone="error">
                                    {t("promptBuilder.missingHelp")}
                                </InlineMessage>
                            )}
                            <div className="prompt-actions">
                                <Button
                                    appearance="pill-secondary"
                                    onClick={() => setScreen("choose")}
                                >
                                    <ArrowLeft size={16} aria-hidden="true" />
                                    {t("promptBuilder.changeMode")}
                                </Button>
                                <Button
                                    appearance="pill"
                                    disabled={missingQuestions(mode, draft).length > 0}
                                    onClick={() => {
                                        setCopyError(false);
                                        setScreen("result");
                                    }}
                                >
                                    <FilePenLine size={16} aria-hidden="true" />
                                    {t("promptBuilder.generate")}
                                </Button>
                            </div>
                        </>
                    )}
                    {screen === "result" && (
                        <>
                            <div className="prompt-intro">
                                <span
                                    className="prompt-emblem prompt-emblem--done"
                                    aria-hidden="true"
                                >
                                    <CheckCheck size={26} />
                                </span>
                                <h2 ref={heading} tabIndex={-1}>
                                    {t("promptBuilder.resultTitle")}
                                </h2>
                            </div>
                            <div className="prompt-result-actions">
                                <Button
                                    appearance="pill"
                                    loading={copying}
                                    onClick={() => void copy()}
                                >
                                    <Copy size={16} aria-hidden="true" />
                                    {t("promptBuilder.copy")}
                                </Button>
                                <Button className="neutral" onClick={download}>
                                    <Download size={16} aria-hidden="true" />
                                    {t("promptBuilder.download")}
                                </Button>
                            </div>
                            {copyError && (
                                <InlineMessage tone="error">
                                    {t("promptBuilder.copyError")}
                                </InlineMessage>
                            )}
                            <TextareaField
                                className="prompt-output"
                                label={t("promptBuilder.outputLabel")}
                                value={prompt}
                                onValueChange={() => undefined}
                                readOnly
                                rows={16}
                                spellCheck={false}
                                onFocus={(event) => {
                                    if (copyError) event.currentTarget.select();
                                }}
                            />
                            <div className="prompt-actions">
                                <Button
                                    appearance="pill-secondary"
                                    onClick={() => setScreen("review")}
                                >
                                    <ArrowLeft size={16} aria-hidden="true" />
                                    {t("promptBuilder.editAnswers")}
                                </Button>
                                <Button
                                    appearance="pill-secondary"
                                    onClick={() => setResetOpen(true)}
                                >
                                    <RotateCcw size={15} aria-hidden="true" />
                                    {t("promptBuilder.restart")}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Modal
                open={resetOpen}
                keyboardDismissible
                size="compact"
                title={t("promptBuilder.resetTitle")}
                description={t("promptBuilder.resetBody")}
                onClose={() => setResetOpen(false)}
                footer={
                    <>
                        <Button className="neutral" onClick={() => setResetOpen(false)}>
                            {t("promptBuilder.cancel")}
                        </Button>
                        <Button
                            onClick={() => {
                                setDrafts({ feature: emptyDraft(), project: emptyDraft() });
                                setIndex(0);
                                setEditing(false);
                                setCopyError(false);
                                setResetOpen(false);
                                setScreen("welcome");
                            }}
                        >
                            {t("promptBuilder.restart")}
                        </Button>
                    </>
                }
            />
        </MainPageTemplate>
    );
}
