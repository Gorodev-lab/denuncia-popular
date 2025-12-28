# Migration Execution Guide: Denuncia Popular -> Esoteria AI

This guide consolidates the steps required to execute the migration of **Denuncia Popular v2.2** to the **Esoteria AI** enterprise ecosystem.

## 📋 Prerequisites

- **GCP Access:** You must have `Project Creator` and `Billing User` roles.
- **Variables:** You need the following IDs:
    - `BILLING_ID` (GCP Billing Account ID)
    - `FOLDER_ID` (Esoteria 'Products' Folder ID)
    - `TECH_LEAD_EMAIL` (For permissions)

---

## 🚀 Phase 1: Infrastructure Deployment

1.  **Configure the Script:**
    Open `setup_infrastructure.sh` and replace the placeholders:
    ```bash
    FOLDER_ID="[INSERT_FOLDER_ID]"
    BILLING_ID="[INSERT_BILLING_ID]"
    TECH_LEAD_EMAIL="[INSERT_TECH_LEAD_EMAIL]"
    ```

2.  **Execute the Script:**
    Run the script to create the 3 environments (`sandbox`, `dev`, `prod`) and link billing.
    ```bash
    chmod +x setup_infrastructure.sh
    ./setup_infrastructure.sh
    ```

3.  **Verify in GCP Console:**
    - Confirm 3 projects were created under the 'Products' folder.
    - Confirm APIs (Maps, Gemini) are enabled in `denuncia-popular-prod`.

---

## 🔐 Phase 2: Security & Credentials

1.  **Generate API Keys (Manual Step):**
    - Go to GCP Console > `denuncia-popular-prod` > APIs & Services > Credentials.
    - Create **Maps API Key** and restrict it to `https://denuncia-popular.vercel.app/*`.
    - Create **Gemini API Key**.

2.  **Configure Vercel:**
    - Open `.env.local.example` to see the required variable names.
    - Go to Vercel > Project Settings > Environment Variables.
    - Add the **Production** keys to the `Production` environment.
    - Add the **Dev** keys to the `Preview` environment.

3.  **Review Security Policy:**
    - Read `SECURITY.md` to understand the compliance requirements for API keys.

---

## 📝 Phase 3: Governance & Documentation

1.  **Formalize Upgrade:**
    - Fill out `docs/UPGRADE_REQUEST.md` with the final Project IDs.
    - Submit for internal approval (or self-approve if Admin).

2.  **Update Knowledge Base:**
    - Copy the content of `docs/OBSIDIAN_RECORD.md` to your Obsidian/Notion knowledge base under `Esoteria / SOPs / Cloud / Projects`.

---

## ✅ Verification

After completing these steps, your application will be fully migrated to the governed Esoteria AI ecosystem.

**Next Steps:**
- Monitor the GCP Billing Dashboard for the first 48 hours.
- Verify that the "Public Beta" app is correctly consuming the new `prod` API keys.
