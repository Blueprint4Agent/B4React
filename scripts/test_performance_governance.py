"""Regression coverage for snapshot-scoped frontend performance reviews."""
import unittest
from pathlib import Path
import subprocess
import sys
import tempfile
from validate_git_governance import WORKLOG_SECTIONS, check_worklogs

TITLE = "perf(react): retain measured boundaries"
LOG = "worklog/0099-performance.md"
REVIEW = ("State Ownership", "Memoization", "Performance Evidence")


def snapshot(review=True, policy=True):
    sections = {heading: "Recorded evidence." for heading in WORKLOG_SECTIONS}
    sections["Commit Title"] = TITLE
    if review:
        sections.update({heading: "Specific decision and evidence." for heading in REVIEW})
    return {
        LOG: "\n\n".join(f"# {heading}\n\n{body}" for heading, body in sections.items()),
        ".github/WORKLOG_TEMPLATE.md": "# Memoization\n" if policy else "# Design\n",
    }


class PerformanceGovernanceTests(unittest.TestCase):
    def verify(self, files, paths=None):
        check_worklogs(paths or [LOG, "src/pages/Page.tsx"], files.__getitem__, TITLE, "fixture snapshot")

    def test_accepts_complete_review(self):
        self.verify(snapshot())

    def test_requires_each_review_section(self):
        for heading in REVIEW:
            with self.subTest(heading=heading):
                files = snapshot()
                files[LOG] = files[LOG].replace(f"# {heading}\n\nSpecific decision and evidence.", "")
                with self.assertRaisesRegex(ValueError, heading):
                    self.verify(files)

    def test_rejects_placeholder_evidence(self):
        files = snapshot()
        files[LOG] = files[LOG].replace("# Performance Evidence\n\nSpecific decision and evidence.", "# Performance Evidence\n\n<!-- planned -->\nTODO")
        with self.assertRaisesRegex(ValueError, "Performance Evidence"):
            self.verify(files)

    def test_preserves_historical_commit_policy(self):
        self.verify(snapshot(review=False, policy=False))

    def test_docs_and_tests_do_not_require_runtime_review(self):
        self.verify(snapshot(review=False), [LOG, "FRONTEND.md", "src/tests/component/Page.test.tsx"])

    def test_dependency_changes_require_review(self):
        with self.assertRaisesRegex(ValueError, "State Ownership"):
            self.verify(snapshot(review=False), [LOG, "package.json"])

    def test_untracked_worklog_does_not_count(self):
        with self.assertRaisesRegex(ValueError, "add or modify a worklog"):
            self.verify(snapshot(), ["src/pages/Page.tsx"])

    def test_missing_legacy_template_is_allowed(self):
        files = snapshot(review=False)
        del files[".github/WORKLOG_TEMPLATE.md"]
        self.verify(files)

    def test_deleted_runtime_files_still_require_review(self):
        files = snapshot(review=False)
        with self.assertRaisesRegex(ValueError, "State Ownership"):
            check_worklogs([LOG], files.__getitem__, TITLE, "deletion snapshot", [LOG, "src/pages/Removed.tsx"])

    def test_cli_reads_index_and_commit_not_unstaged_worktree(self):
        script = Path(__file__).with_name("validate_git_governance.py").resolve()
        with tempfile.TemporaryDirectory(prefix="b4-performance-governance-") as directory:
            root = Path(directory)
            def run(*args):
                return subprocess.run(args, cwd=root, text=True, capture_output=True)
            for args in [("git", "init", "-b", "perf/fixture"), ("git", "config", "user.email", "test@example.com"), ("git", "config", "user.name", "Fixture")]:
                self.assertEqual(run(*args).returncode, 0)
            files = snapshot(review=False)
            files["src/pages/Page.tsx"] = "export const Page = () => null;"
            for name, content in files.items():
                target = root / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(content)
            run("git", "add", ".")
            # A complete unstaged worklog cannot mask a missing staged review.
            (root / LOG).write_text(snapshot()[LOG])
            message = root / "message.txt"
            message.write_text(TITLE + "\n\nChanges:\n- Fixture.\n\nAffected Files:\n- Fixture.\n\nVerification:\n- Fixture.\n")
            args = (sys.executable, str(script), "--commit-title", TITLE, "--commit-body-file", str(message))
            result = run(*args)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("State Ownership", result.stderr)
            run("git", "add", LOG)
            self.assertEqual(run(*args).returncode, 0)
            self.assertEqual(run("git", "commit", "-F", str(message)).returncode, 0)
            # HEAD validation must read committed policy/evidence despite dirty files.
            (root / LOG).write_text("broken unstaged worklog")
            (root / ".github/WORKLOG_TEMPLATE.md").write_text("broken unstaged policy")
            result = run(sys.executable, str(script), "--commit-title", "")
            self.assertEqual(result.returncode, 0, result.stderr)
