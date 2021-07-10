import sys

print("🏥 Running patches doctor...")

print("\nThis doctor only checks two major files required for Dot Browser to build. You may want to check the other files.\n")

try:
    check1 = open('engine/browser/app/profile/firefox.js')
    check2 = open('engine/browser/confvars.sh')
except FileNotFoundError:
    sys.exit('❌ Patches failed to apply. Missing source files.')

if (('Dot Browser' in check1.read()) and ('MOZ_BRANDING_DIRECTORY=browser/branding/dot' in check2.read())):
    print("✅ Patches have applied successfully.")
else:
    sys.exit('❌ Patches failed to apply.')