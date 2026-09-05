from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Enum as SqlEnum, Text
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import enum

Base = declarative_base()

class GradeTierEnum(str, enum.Enum):
    O = "O"
    A = "A"
    B = "B"
    C = "C"
    D = "D"
    E = "E"

class ProfileModel(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    bio = Column(Text)
    avatar_url = Column(String)
    level = Column(Integer, default=1)
    total_xp = Column(Integer, default=0)
    ai_quality_index = Column(Float, default=0.0)
    verified_repos_count = Column(Integer, default=0)
    github_username = Column(String)
    polygon_wallet_address = Column(String)
    location = Column(String)
    availability = Column(String, default="Passive / Exploring")
    is_identity_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("ProjectModel", back_populates="profile", cascade="all, delete-orphan")
    skills = relationship("SkillModel", back_populates="profile", cascade="all, delete-orphan")

class ProjectModel(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True)
    profile_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    slug = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    repo_url = Column(String, nullable=False)
    grade = Column(SqlEnum(GradeTierEnum), default=GradeTierEnum.B)
    score = Column(Float, default=0.0)
    architecture_score = Column(Float, default=0.0)
    test_coverage = Column(Float, default=0.0)
    code_quality = Column(Float, default=0.0)
    doc_clarity = Column(Float, default=0.0)
    sha256_hash = Column(String, nullable=False)
    polygon_tx_hash = Column(String)
    merkle_root = Column(String)
    commit_count = Column(Integer, default=0)
    loc_count = Column(Integer, default=0)
    gemini_review_note = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("ProfileModel", back_populates="projects")
    attributions = relationship("AttributionModel", back_populates="project", cascade="all, delete-orphan")

class AttributionModel(Base):
    __tablename__ = "contributor_attributions"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    contributor_name = Column(String, nullable=False)
    github_handle = Column(String, nullable=False)
    role_description = Column(String)
    lines_of_code = Column(Integer, default=0)
    percentage = Column(Float, default=0.0)
    is_verified_gpg = Column(Boolean, default=True)

    project = relationship("ProjectModel", back_populates="attributions")

class SkillModel(Base):
    __tablename__ = "skill_matrix"

    id = Column(String, primary_key=True)
    profile_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    skill_name = Column(String, nullable=False)
    grade = Column(SqlEnum(GradeTierEnum), default=GradeTierEnum.B)
    score = Column(Integer, default=70)
    xp = Column(Integer, default=500)

    profile = relationship("ProfileModel", back_populates="skills")
