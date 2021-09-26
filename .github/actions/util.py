import subprocess
import sys
from time import sleep
import sentry_sdk

sentry_sdk.init(
    "https://c3f074b3d0e54c18a1f7c22ed184784c@o268813.ingest.sentry.io/5979589",

    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production.
    traces_sample_rate=1.0
)

def run(cmd):
    print(f"\n--- Executing `{cmd}`... ---\n")
    sleep(1)

    process = subprocess.Popen(cmd, shell=True, stderr=subprocess.PIPE, universal_newlines=True)

    while True:
        out = process.stderr.read(1)
        if out == '' and process.poll() != None:
            exit_code = process.poll()

            if exit_code != 0:
                print(f"\n--- An error occurred. ---")
                raise Exception(f"Error occurred while running `{cmd}`")
                exit(process.poll())

            break
        if out != '':
            sys.stdout.write(str(out))
            sys.stdout.flush()