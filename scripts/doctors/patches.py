import sys

print("🏥 Running patches doctor...")

print("\nThis doctor only checks two major files required for Dot Browser to build. You may want to check the other files.\n")

check1 = open('src/browser/app/profile/firefox.js')
check2 = open('src/browser/confvars.sh')

if (('Dot Browser' in check1.read()) and ('MOZ_BRANDING_DIRECTORY=browser/branding/dot' in check2.read())):
    print("✅ Patches have applied successfully.")
else:
    sys.exit('❌ Patches failed to apply.')