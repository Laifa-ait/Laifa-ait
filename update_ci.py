import os

# SHAs
SHAS = {
    "actions/checkout@v4": "actions/checkout@f548e57e544e1ff5a4c46bf1e1b8685f8e4a348a",
    "actions/setup-java@v5": "actions/setup-java@273229181560643261a71a1544c22304f2a40df8",
    "actions/setup-node@v4": "actions/setup-node@94196ee1d15439c1b6651cd87ef14e88ec435966",
    "actions/upload-artifact@v4": "actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a",
    "actions/download-artifact@v4": "actions/download-artifact@484a0b528fb4d7bd804637ccb632e47a0e638317",
    "github/codeql-action/init@v3": "github/codeql-action/init@a0c73122a6231d3a72b4b04036548af1cd2487c9",
    "github/codeql-action/analyze@v3": "github/codeql-action/analyze@a0c73122a6231d3a72b4b04036548af1cd2487c9"
}

def replace_shas(content):
    for old, new in SHAS.items():
        content = content.replace(old, new)
    return content

# 1. Update ci.yml
with open(".github/workflows/ci.yml", "r") as f:
    ci_content = f.read()

ci_content = replace_shas(ci_content)

# Update CSRF_SECRET
ci_content = ci_content.replace(
    'CSRF_SECRET: olmart_production_test_csrf_secret_key_2026_secure_abcdef123456789',
    'CSRF_SECRET: ${{ secrets.CSRF_SECRET }}'
)

# Append deployment jobs
deployment_jobs = """
  docker-build-scan:
    name: Build Docker, Scan & Generate SBOM
    runs-on: ubuntu-latest
    needs: e2e
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master' || github.ref == 'refs/heads/dev'
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@f548e57e544e1ff5a4c46bf1e1b8685f8e4a348a
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@b5ca514318bd6ebac0fb2aedd5d36ec1b5c232a2 # v3
      
      - name: Build Docker Image
        id: build
        uses: docker/build-push-action@4f58ea79222b3b9dc2c8bbdd6debcef730109a75 # v6
        with:
          context: .
          push: false
          tags: olmart-app:local
          load: true
          
      - name: Generate SBOM (Anchore Syft)
        uses: anchore/sbom-action@3ad7283483fc7af8ff2b4ea19663c2d5ca935e26
        with:
          image: olmart-app:local
          artifact-name: sbom.spdx.json
          
      - name: Run Trivy Vulnerability Scanner
        uses: aquasecurity/trivy-action@d2a0b60797ff03db6132bd4e2b293f9b37081297
        with:
          image-ref: 'olmart-app:local'
          format: 'table'
          exit-code: '1'
          ignore-unfixed: true
          vuln-type: 'os,library'
          severity: 'CRITICAL,HIGH'
          
  deploy-staging:
    name: Deploy to Staging (Cloud Run)
    runs-on: ubuntu-latest
    needs: docker-build-scan
    if: github.ref == 'refs/heads/dev' || github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
    environment: staging
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@f548e57e544e1ff5a4c46bf1e1b8685f8e4a348a
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@12060449e87204eca501a11f2f7f1483024afff0
        with:
          credentials_json: ${{ secrets.GCP_CREDENTIALS_STAGING }}
      - name: Deploy to Cloud Run (Staging)
        uses: google-github-actions/deploy-cloudrun@2028e2d7d30a78c6910e0632e48dd561b064884d
        with:
          service: olmart-staging
          region: europe-west2
          source: .
          env_vars: |
            NODE_ENV=production
          secrets: |
            CSRF_SECRET=CSRF_SECRET:latest

  deploy-production:
    name: Deploy to Production (Cloud Run)
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
    environment: 
      name: production
      url: https://olmart.dz
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@f548e57e544e1ff5a4c46bf1e1b8685f8e4a348a
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@12060449e87204eca501a11f2f7f1483024afff0
        with:
          credentials_json: ${{ secrets.GCP_CREDENTIALS_PRODUCTION }}
      - name: Deploy to Cloud Run (Production)
        uses: google-github-actions/deploy-cloudrun@2028e2d7d30a78c6910e0632e48dd561b064884d
        with:
          service: olmart-production
          region: europe-west2
          source: .
          env_vars: |
            NODE_ENV=production
          secrets: |
            CSRF_SECRET=CSRF_SECRET:latest
"""

ci_content += deployment_jobs

with open(".github/workflows/ci.yml", "w") as f:
    f.write(ci_content)

# 2. Update codeql.yml
if os.path.exists(".github/workflows/codeql.yml"):
    with open(".github/workflows/codeql.yml", "r") as f:
        c_content = f.read()
    c_content = replace_shas(c_content)
    with open(".github/workflows/codeql.yml", "w") as f:
        f.write(c_content)

# 3. Update security-audit.yml
if os.path.exists(".github/workflows/security-audit.yml"):
    with open(".github/workflows/security-audit.yml", "r") as f:
        sa_content = f.read()
    sa_content = replace_shas(sa_content)
    with open(".github/workflows/security-audit.yml", "w") as f:
        f.write(sa_content)

print("Updates applied.")
