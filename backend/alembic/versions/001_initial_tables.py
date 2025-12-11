"""Initial tables

Revision ID: 001
Revises:
Create Date: 2025-01-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # iss_fetch_log - ISS position history
    op.create_table(
        "iss_fetch_log",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("lat", sa.Float(), nullable=False, comment="Latitude"),
        sa.Column("lon", sa.Float(), nullable=False, comment="Longitude"),
        sa.Column("alt_km", sa.Float(), nullable=False, comment="Altitude in kilometers"),
        sa.Column("velocity_kmh", sa.Float(), nullable=False, comment="Velocity in km/h"),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False, comment="Timestamp of the position"),
        sa.Column("source_url", sa.String(500), nullable=False, comment="API source URL"),
        sa.Column("raw", postgresql.JSONB(), nullable=True, comment="Raw API response"),
        sa.Column("inserted_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False, comment="Record insertion time"),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index("ix_iss_fetch_log_timestamp", "iss_fetch_log", ["timestamp"])

    # osdr_items - NASA OSDR datasets
    op.create_table(
        "osdr_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("dataset_id", sa.String(255), nullable=False, comment="Unique dataset identifier"),
        sa.Column("title", sa.Text(), nullable=True, comment="Dataset title"),
        sa.Column("status", sa.String(50), nullable=True, comment="Dataset status"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True, comment="Last update time from source"),
        sa.Column("raw", postgresql.JSONB(), nullable=True, comment="Raw API response"),
        sa.Column("inserted_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False, comment="Record insertion time"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("dataset_id", name="uq_osdr_items_dataset_id")
    )
    op.create_index("ix_osdr_items_dataset_id", "osdr_items", ["dataset_id"])

    # space_cache - Universal JSON cache
    op.create_table(
        "space_cache",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("source", sa.String(50), nullable=False, comment="Data source identifier"),
        sa.Column("fetched_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False, comment="Time when data was fetched"),
        sa.Column("payload", postgresql.JSONB(), nullable=False, comment="Cached JSON payload"),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index("ix_space_cache_source_fetched", "space_cache", ["source", "fetched_at"])

    # telemetry_legacy - Legacy telemetry data
    op.create_table(
        "telemetry_legacy",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False, comment="Time when telemetry was recorded"),
        sa.Column("voltage", sa.Float(), nullable=False, comment="Voltage reading"),
        sa.Column("temp", sa.Float(), nullable=False, comment="Temperature reading"),
        sa.Column("source_file", sa.String(255), nullable=True, comment="Source CSV file name"),
        sa.PrimaryKeyConstraint("id")
    )
    op.create_index("ix_telemetry_legacy_recorded_at", "telemetry_legacy", ["recorded_at"])


def downgrade() -> None:
    op.drop_table("telemetry_legacy")
    op.drop_table("space_cache")
    op.drop_table("osdr_items")
    op.drop_table("iss_fetch_log")
