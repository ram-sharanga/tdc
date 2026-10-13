import type { Stage } from "@/types/profile";

// Maps a stage to the CSS class
const CLASS: Record<Stage, string> = {
    Onboarded: "Onboarded",
    Verified: "Verified",
    "Profile Shared": "Shared",
    "Meeting Scheduled": "Meeting",
    Feedback: "Feedback",
    Closed: "Closed",
};

export default function StagePill({ stage }: { stage: Stage }) {
    return <span className={`pill s-${CLASS[stage]}`}>{stage}</span>;
}