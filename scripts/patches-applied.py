import sys

print("checking...")

check1 = open('src/browser/app/profile/firefox.js')
check2 = open('src/browser/confvars.sh')

if (('Dot Browser' in check1.read()) and ('MOZ_BRANDING_DIRECTORY=browser/branding/dot' in check2.read())):
    print("patches applied successfully")
else:
    sys.exit('patches failed to apply')