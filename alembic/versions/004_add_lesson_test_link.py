"""add lesson test link

Revision ID: 004_add_lesson_test_link
Revises: 003_add_test_results
Create Date: 2026-05-18
"""

from alembic import op
import sqlalchemy as sa


revision = "004_add_lesson_test_link"
down_revision = "003_add_test_results"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("lessons", sa.Column("test_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_lessons_test_id_tests",
        "lessons",
        "tests",
        ["test_id"],
        ["id"],
    )


def downgrade():
    op.drop_constraint("fk_lessons_test_id_tests", "lessons", type_="foreignkey")
    op.drop_column("lessons", "test_id")
