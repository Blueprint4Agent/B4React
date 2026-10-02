"""UI reviews apply to the same snapshot as the commit, including CSS and deletions."""
import unittest
from validate_git_governance import WORKLOG_SECTIONS, check_worklogs

TITLE = "style(ui): align settings"
LOG = "worklog/0099-family.md"
FIELDS = ("Family", "Reference", "Shared Rules", "Exceptions", "Evidence")


def snapshot(policy=True):
    content = "\n\n".join(f"# {key}\n\n{TITLE if key == 'Commit Title' else 'Recorded decision.'}" for key in WORKLOG_SECTIONS)
    content += "\n\n# Page Family\n\n" + "\n\n".join(f"## {key}\n\nConcrete comparison evidence." for key in FIELDS)
    return {LOG: content, ".github/WORKLOG_TEMPLATE.md": "# Page Family" if policy else "# Design"}


class PageFamilyGovernanceTests(unittest.TestCase):
    def verify(self, files, changes=None):
        check_worklogs([LOG], files.__getitem__, TITLE, "fixture", changes or ["src/styles/app.css"])

    def test_ui_paths_and_css_require_review(self):
        for path in ("src/styles/app.css", "src/pages/settings/Page.tsx", "src/components/features/New.tsx", "src/components/ui/Button.tsx", "src/App.tsx", "src/main.tsx"):
            with self.subTest(path=path):
                self.verify(snapshot(), [path])
                files = snapshot()
                files[LOG] = files[LOG].split("# Page Family")[0]
                with self.assertRaisesRegex(ValueError, "Page Family"):
                    self.verify(files, [path])

    def test_each_field_requires_real_content(self):
        for field in FIELDS:
            for value in ("", "TODO", "<!-- explanation -->", "N/A", "none"):
                with self.subTest(field=field, value=value):
                    files = snapshot()
                    files[LOG] = files[LOG].replace(f"## {field}\n\nConcrete comparison evidence.", f"## {field}\n\n{value}")
                    with self.assertRaisesRegex(ValueError, field):
                        self.verify(files)

    def test_legacy_and_non_ui_snapshots_remain_valid(self):
        for changes in (["README.md"], ["src/tests/component/Page.test.tsx"], ["src/hooks/useApi.ts"]):
            files = snapshot()
            files[LOG] = files[LOG].split("# Page Family")[0]
            self.verify(files, changes)
        files = snapshot(policy=False)
        files[LOG] = files[LOG].split("# Page Family")[0]
        self.verify(files)

    def test_title_matching_log_must_contain_evidence(self):
        files = snapshot()
        other = "worklog/0098-other.md"
        files[other] = files[LOG].replace(TITLE, "style(ui): unrelated change")
        files[LOG] = files[LOG].split("# Page Family")[0]
        with self.assertRaisesRegex(ValueError, "Page Family"):
            check_worklogs([LOG, other], files.__getitem__, TITLE, "fixture", ["src/styles/deleted.css"])
