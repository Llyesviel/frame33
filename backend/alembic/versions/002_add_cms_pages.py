"""Add CMS pages table

Revision ID: 002
Revises: 001
Create Date: 2025-01-02

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # cms_pages - CMS content blocks
    op.create_table(
        "cms_pages",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("slug", sa.String(255), nullable=False, comment="Unique slug identifier"),
        sa.Column("title", sa.String(500), nullable=False, comment="Block title"),
        sa.Column("html_body", sa.Text(), nullable=True, comment="HTML content"),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False, comment="Whether block is active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False, comment="Creation timestamp"),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False, comment="Last update timestamp"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_cms_pages_slug")
    )
    op.create_index("ix_cms_pages_slug", "cms_pages", ["slug"])
    op.create_index("ix_cms_pages_is_active", "cms_pages", ["is_active"])


def downgrade() -> None:
    op.drop_table("cms_pages")
