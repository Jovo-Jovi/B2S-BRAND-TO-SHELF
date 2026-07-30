# Security Policy

## Reporting a vulnerability
Open a private security advisory via the GitHub Security tab. Do not open a
public issue for a suspected vulnerability.

## Scope
This repository is public. It must never contain credentials, service-role
keys, connection strings, customer data, or real invoice data. Test fixtures
are synthetic.

## Secrets
Secret scanning and push protection are enabled. Any credential that reaches
a commit is treated as compromised and rotated, not merely deleted — git
history is permanent.
