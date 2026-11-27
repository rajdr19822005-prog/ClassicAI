-- Defense in depth for encrypted third-party integration references.
-- No direct policies or user grants: access remains through server-side RPCs.
ALTER TABLE private.doctor_integrations ENABLE ROW LEVEL SECURITY;
