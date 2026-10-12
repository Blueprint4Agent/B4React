import type { TFunction } from "i18next";
import type { InquiryDetail } from "../../api/inquiries/inquiriesApi";

export function demoInquiries(t: TFunction): InquiryDetail[] {
    return (["open", "in_progress", "closed"] as const).map((status, index) => ({
        id: index + 1,
        subject: t(`support.demoSamples.${index}.subject`),
        status,
        created_at: "2026-01-15T09:00:00Z",
        updated_at: "2026-01-15T10:00:00Z",
        requester_name: t("support.demoRequester", { number: index + 1 }),
        requester_email: `sample${index + 1}@example.invalid`,
        messages: [
            {
                id: index * 2 + 1,
                author_role: "user" as const,
                body: t(`support.demoSamples.${index}.body`),
                created_at: "2026-01-15T09:00:00Z",
            },
            ...(index > 0
                ? [
                      {
                          id: index * 2 + 2,
                          author_role: "admin" as const,
                          body: t(`support.demoSamples.${index}.reply`),
                          created_at: "2026-01-15T10:00:00Z",
                      },
                  ]
                : []),
        ],
    }));
}
