import uuid
import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class InterviewService:
    """
    Manages recruiter interview invitations, deterministic Jitsi Meet room generation,
    candidate notifications with Accept/Decline actions, and recruiter dashboard synchronization.
    """

    def __init__(self):
        # In-memory interviews store
        self.interviews: List[Dict[str, Any]] = [
            {
                "id": "int_gnaneshwar_1",
                "candidate_username": "gnaneshwar",
                "candidate_name": "GNANESHWAR R",
                "candidate_avatar": "https://avatars.githubusercontent.com/u/7891234?v=4",
                "job_title": "Frontend Engineer",
                "company": "Acme Technologies",
                "date": "2024-11-23",
                "time": "2:00 PM EST",
                "duration": "45 minutes",
                "message": "Interview invitation from Acme Technologies for the Frontend Engineer position. Your verified ProofHire portfolio and 92% match score stood out.",
                "interviewer": "Sarah Lin (VP of Talent Acquisition)",
                "jitsi_url": "https://meet.jit.si/proofhire-acme-frontend-engineer-gnaneshwar-huddle",
                "status": "PENDING",
                "created_at": "2024-11-20T08:30:00Z"
            },
            {
                "id": "int_priya_2",
                "candidate_username": "psharma",
                "candidate_name": "Priya Sharma",
                "candidate_avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces",
                "job_title": "Founding ML Infrastructure Engineer",
                "company": "Synthetix Labs",
                "date": "2024-11-24",
                "time": "11:00 AM PST",
                "duration": "60 minutes",
                "message": "Technical deep dive on vLLM Triton kernel compilation and multi-GPU tensor communication.",
                "interviewer": "Kavita Desai (Head of Technical Talent)",
                "jitsi_url": "https://meet.jit.si/proofhire-synthetix-ml-infra-psharma-eval",
                "status": "ACCEPTED",
                "created_at": "2024-11-19T14:00:00Z"
            },
            {
                "id": "int_alex_3",
                "candidate_username": "alexchen",
                "candidate_name": "Alex Chen",
                "candidate_avatar": "https://avatars.githubusercontent.com/u/1024025?v=4",
                "job_title": "Senior Distributed Systems Engineer",
                "company": "Nexus Cloud Infrastructure",
                "date": "2024-11-25",
                "time": "3:30 PM PST",
                "duration": "45 minutes",
                "message": "Architecture review of HyperRaft consensus engine and Linux kernel io_uring network benchmarks.",
                "interviewer": "Marcus Vance (Director of Infrastructure Recruiting)",
                "jitsi_url": "https://meet.jit.si/proofhire-nexus-dist-systems-alexchen-arch",
                "status": "ACCEPTED",
                "created_at": "2024-11-19T10:00:00Z"
            }
        ]

        # Candidate Notifications store
        self.notifications: List[Dict[str, Any]] = [
            {
                "id": "notif_gnaneshwar_1",
                "candidate_username": "gnaneshwar",
                "title": "Interview invitation from Acme Technologies",
                "message": "Interview invitation from Acme Technologies for the Frontend Engineer position. Your verified ProofHire portfolio and 92% match score stood out.",
                "job_title": "Frontend Engineer",
                "company": "Acme Technologies",
                "date": "2024-11-23",
                "time": "2:00 PM EST",
                "duration": "45 minutes",
                "interview_id": "int_gnaneshwar_1",
                "jitsi_url": "https://meet.jit.si/proofhire-acme-frontend-engineer-gnaneshwar-huddle",
                "status": "PENDING",
                "read": False,
                "created_at": "2024-11-20T08:30:00Z"
            }
        ]

    def generate_jitsi_url(self, job_title: str, candidate_username: str) -> str:
        """Generates a collision-resistant Jitsi Meet room URL."""
        slug = re.sub(r'[^a-zA-Z0-9]+', '-', job_title.lower()).strip('-')[:24]
        unique_suffix = uuid.uuid4().hex[:6]
        room_name = f"proofhire-acme-{slug}-{candidate_username}-{unique_suffix}"
        return f"https://meet.jit.si/{room_name}"

    def invite_to_interview(
        self,
        candidate_username: str,
        candidate_name: str,
        job_title: str,
        date: str,
        time: str,
        duration: str,
        message: str,
        candidate_avatar: Optional[str] = None,
        company: str = "Acme Technologies",
        interviewer: str = "Sarah Lin (VP of Engineering)"
    ) -> Dict[str, Any]:
        """
        Creates an interview session, generates Jitsi Meet meeting room,
        and dispatches candidate notification.
        """
        interview_id = f"int_{uuid.uuid4().hex[:8]}"
        jitsi_url = self.generate_jitsi_url(job_title, candidate_username)

        interview_record = {
            "id": interview_id,
            "candidate_username": candidate_username,
            "candidate_name": candidate_name,
            "candidate_avatar": candidate_avatar or f"https://avatars.githubusercontent.com/u/{len(candidate_username)*12345}?v=4",
            "job_title": job_title,
            "company": company,
            "date": date,
            "time": time,
            "duration": duration,
            "message": message,
            "interviewer": interviewer,
            "jitsi_url": jitsi_url,
            "status": "PENDING",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.interviews.insert(0, interview_record)

        # Dispatch candidate notification
        notif_id = f"notif_{uuid.uuid4().hex[:8]}"
        notification = {
            "id": notif_id,
            "candidate_username": candidate_username,
            "title": f"Interview invitation from {company}",
            "message": message,
            "job_title": job_title,
            "company": company,
            "date": date,
            "time": time,
            "duration": duration,
            "interview_id": interview_id,
            "jitsi_url": jitsi_url,
            "status": "PENDING",
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.notifications.insert(0, notification)

        return {
            "interview": interview_record,
            "notification": notification,
            "status": "INVITED",
            "message": f"Interview invitation dispatched to {candidate_name}."
        }

    def respond_to_interview(self, interview_id: str, candidate_username: str, action: str) -> Dict[str, Any]:
        """
        Candidate responds to interview invitation with Accept or Decline.
        """
        action_upper = action.strip().upper()
        if action_upper not in ["ACCEPT", "DECLINE"]:
            raise ValueError("Action must be either 'ACCEPT' or 'DECLINE'")

        interview = next((i for i in self.interviews if i["id"] == interview_id), None)
        if not interview:
            raise ValueError("Interview record not found")

        new_status = "ACCEPTED" if action_upper == "ACCEPT" else "DECLINED"
        interview["status"] = new_status

        # Update matching notification
        for notif in self.notifications:
            if notif.get("interview_id") == interview_id:
                notif["status"] = new_status
                notif["read"] = True

        return {
            "interview_id": interview_id,
            "candidate_username": candidate_username,
            "status": new_status,
            "jitsi_url": interview["jitsi_url"] if new_status == "ACCEPTED" else None,
            "message": f"Interview successfully {new_status.lower()}."
        }

    def get_candidate_notifications(self, candidate_username: str) -> List[Dict[str, Any]]:
        """Returns all notifications for candidate."""
        uname = candidate_username.lower()
        return [n for n in self.notifications if n["candidate_username"].lower() == uname]

    def get_upcoming_interviews(self) -> List[Dict[str, Any]]:
        """Returns upcoming scheduled and accepted interviews for recruiter dashboard."""
        # Include both ACCEPTED and PENDING interviews with priority to ACCEPTED
        return [i for i in self.interviews if i["status"] in ["ACCEPTED", "PENDING"]]

interview_service = InterviewService()
