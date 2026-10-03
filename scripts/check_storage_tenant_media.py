#!/usr/bin/env python3
"""The private bucket, its policies and the Asset-tier checks. P03-T20.

schema.sql is the enumeration. The lists below are the stated set. A count
that is not equal to its list, or a list the schema does not contain, fails.
No existing check counted storage policies; this one does (PR-15).
"""
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHEMA = os.path.join(REPO, "supabase", "schema.sql")

# Floors are the true counts of the lists they guard. A schema that lost
# the bucket, a policy or a constraint examines less than the floor.
MINIMUM_STORAGE_POLICIES = 2
MINIMUM_PRIVATE_BUCKETS = 1
MINIMUM_STORAGE_CONSTRAINTS = 7

EXPECTED_POLICIES = [
    ("tenant_media_select_member", "select"),
    ("tenant_media_insert_member", "insert"),
]
EXPECTED_CONSTRAINTS = [
    "media_asset_provider_permitted",
    "media_asset_bucket_permitted",
    "media_asset_object_key_tenant_prefix",
    "media_asset_checksum_sha256",
    "asset_rendition_provider_permitted",
    "asset_rendition_bucket_permitted",
    "asset_rendition_object_key_tenant_prefix",
]

POLICY_RE = re.compile(
    r"create\s+policy\s+(\w+)\s+on\s+storage\.objects\s+for\s+(select|insert|update|delete|all)\b",
    re.I,
)
BUCKET_RE = re.compile(
    r"insert\s+into\s+storage\.buckets\s*\(([^)]*)\)\s*values\s*\(([^)]*)\)",
    re.I,
)
CONSTRAINT_RE = re.compile(
    r"\bconstraint\s+([a-z0-9_]+)\b",
    re.I,
)


def fail(message):
    print(f"FAIL: {message}")
    sys.exit(1)


def main():
    if not os.path.isfile(SCHEMA):
        fail(f"{SCHEMA} does not exist — the bucket, its policies and the "
             f"checks are asserted against schema.sql")

    with open(SCHEMA, encoding="utf-8") as handle:
        text = handle.read()

    if len(EXPECTED_POLICIES) < MINIMUM_STORAGE_POLICIES:
        fail(f"the stated policy list has {len(EXPECTED_POLICIES)} row(s), "
             f"minimum {MINIMUM_STORAGE_POLICIES}")
    found_policies = [(name, command.lower()) for name, command in POLICY_RE.findall(text)]
    if len(found_policies) < MINIMUM_STORAGE_POLICIES:
        fail(f"schema.sql declares {len(found_policies)} storage.objects "
             f"polic(ies), minimum {MINIMUM_STORAGE_POLICIES}")
    if found_policies != EXPECTED_POLICIES:
        fail(f"storage.objects policies are {found_policies}, stated set is "
             f"{EXPECTED_POLICIES}")
    write_policies = [row for row in found_policies if row[1] in ("update", "delete", "all")]
    if write_policies:
        fail(f"storage.objects has an UPDATE, DELETE or ALL policy: {write_policies}")

    if len(EXPECTED_CONSTRAINTS) < MINIMUM_STORAGE_CONSTRAINTS:
        fail(f"the stated constraint list has {len(EXPECTED_CONSTRAINTS)} name(s), "
             f"minimum {MINIMUM_STORAGE_CONSTRAINTS}")
    found_constraints = CONSTRAINT_RE.findall(text)
    missing = [name for name in EXPECTED_CONSTRAINTS if name not in found_constraints]
    if len(EXPECTED_CONSTRAINTS) - len(missing) < MINIMUM_STORAGE_CONSTRAINTS or missing:
        fail(f"schema.sql is missing storage constraint(s) {missing}; "
             f"{len(EXPECTED_CONSTRAINTS) - len(missing)} of "
             f"{len(EXPECTED_CONSTRAINTS)} present, minimum "
             f"{MINIMUM_STORAGE_CONSTRAINTS}")

    inserts = BUCKET_RE.findall(text)
    if len(inserts) < MINIMUM_PRIVATE_BUCKETS:
        fail(f"schema.sql inserts {len(inserts)} storage bucket(s), minimum "
             f"{MINIMUM_PRIVATE_BUCKETS}")
    private = []
    public = []
    for columns, values in inserts:
        names = [part.strip() for part in columns.split(",")]
        vals = [part.strip().strip("'") for part in values.split(",")]
        row = dict(zip(names, vals))
        if row.get("public", "").lower() == "false":
            private.append(row.get("id"))
        else:
            public.append(row)
    if public:
        fail(f"schema.sql inserts a public bucket: {public}")
    if private != ["tenant-media"]:
        fail(f"private buckets are {private}, stated set is ['tenant-media']")

    print(
        f"OK: {len(found_policies)} storage.objects polic(ies) "
        f"{[name for name, _ in found_policies]}, minimum {MINIMUM_STORAGE_POLICIES}; "
        f"{len(private)} private bucket(s) {private}, minimum {MINIMUM_PRIVATE_BUCKETS}; "
        f"0 public bucket insert(s); "
        f"{len(EXPECTED_CONSTRAINTS)} storage constraint(s), minimum "
        f"{MINIMUM_STORAGE_CONSTRAINTS}"
    )


if __name__ == "__main__":
    main()
