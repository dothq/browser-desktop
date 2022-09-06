/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include <stdio.h>

#include "mozilla/Bootstrap.h"
#include "BinaryPath.h"
#include "XREShellData.h"
#include "application.ini.h"
#include "mozilla/CmdLineAndEnvUtils.h"
#include "mozilla/Sprintf.h"
#include "BrowserDefines.h"

using namespace mozilla;

const char* kDesktopFolder = "dot";

static MOZ_FORMAT_PRINTF(1, 2) void Output(const char* fmt, ...) {
  va_list ap;
  va_start(ap, fmt);

#ifndef XP_WIN
  vfprintf(stderr, fmt, ap);
#else
  char msg[2048];
  vsnprintf_s(msg, _countof(msg), _TRUNCATE, fmt, ap);

  wchar_t wide_msg[2048];
  MultiByteToWideChar(CP_UTF8, 0, msg, -1, wide_msg, _countof(wide_msg));
#  if MOZ_WINCONSOLE
  fwprintf_s(stderr, wide_msg);
#  else
  // Linking user32 at load-time interferes with the DLL blocklist (bug 932100).
  // This is a rare codepath, so we can load user32 at run-time instead.
  HMODULE user32 = LoadLibraryW(L"user32.dll");
  if (user32) {
    decltype(MessageBoxW)* messageBoxW =
        (decltype(MessageBoxW)*)GetProcAddress(user32, "MessageBoxW");
    if (messageBoxW) {
      messageBoxW(nullptr, wide_msg, L"Dot Browser",
                  MB_OK | MB_ICONERROR | MB_SETFOREGROUND);
    }
    FreeLibrary(user32);
  }
#  endif
#endif

  va_end(ap);
}

/**
 * Return true if |arg| matches the given argument name.
 */
static bool IsArg(const char* arg, const char* s) {
  if (*arg == '-') {
    if (*++arg == '-') ++arg;
    return !strcasecmp(arg, s);
  }

#if defined(XP_WIN)
  if (*arg == '/') return !strcasecmp(++arg, s);
#endif

  return false;
}

Bootstrap::UniquePtr gBootstrap;

static nsresult InitXPCOMGlue(LibLoadingStrategy aLibLoadingStrategy) {
    // If we have already bootstraped, we do not want to do it again
    if (gBootstrap) {
        return NS_OK;
    }

    UniqueFreePtr<char> exePath = BinaryPath::Get();
    if (!exePath) {
        Output("Couldn't find the application directory.\n");
        return NS_ERROR_FAILURE;
    }

    // Load the XPCOM dynamic library
    auto bootstrapResult =
        mozilla::GetBootstrap(exePath.get(), aLibLoadingStrategy);
    if (bootstrapResult.isErr()) {
        Output("Couldn't load XPCOM.\n");
        return NS_ERROR_FAILURE;
    }

    gBootstrap = bootstrapResult.unwrap();

    // Start the main thread
    gBootstrap->NS_LogInit();

    return NS_OK;
}

// This is a renamed version of the firefox do_main function
static int runXPCShell(int argc, char* argv[], char* envp[]) {
    const char* appDataFile = getenv("XUL_APP_FILE");
    if ((!appDataFile || !*appDataFile) && (argc > 1 && IsArg(argv[1], "app"))) {
        if (argc == 2) {
            Output("Incorrect number of arguments passed to -app");
            return 255;
        }
        appDataFile = argv[2];

        char appEnv[MAXPATHLEN];
        SprintfLiteral(appEnv, "XUL_APP_FILE=%s", argv[2]);
        if (putenv(strdup(appEnv))) {
            Output("Couldn't set %s.\n", appEnv);
            return 255;
        }
        argv[2] = argv[0];
        argv += 2;
        argc -= 2;
    } else if (argc > 1 && IsArg(argv[1], "xpcshell")) {
        for (int i = 1; i < argc; i++) {
            argv[i] = argv[i + 1];
        }

        XREShellData shellData;
#if defined(XP_WIN) && defined(MOZ_SANDBOX)
        shellData.sandboxBrokerServices =
            sandboxing::GetInitializedBrokerServices();
#endif

#ifdef LIBFUZZER
        shellData.fuzzerDriver = fuzzer::FuzzerDriver;
#endif

        return gBootstrap->XRE_XPCShellMain(--argc, argv, envp, &shellData);
    }

    BootstrapConfig config;

   if (appDataFile && *appDataFile) {
        config.appData = nullptr;
        config.appDataPath = appDataFile;
    } else {
        // no -app flag so we use the compiled-in app data
        config.appData = &sAppData;
        config.appDataPath = kDesktopFolder;
    }

#if defined(XP_WIN) && defined(MOZ_SANDBOX)
    sandbox::BrokerServices* brokerServices =
        sandboxing::GetInitializedBrokerServices();
    sandboxing::PermissionsService* permissionsService =
        sandboxing::GetPermissionsService();

    if (!brokerServices) {
        Output("Couldn't initialize the broker services.\n");
        return 255;
    }

    config.sandboxBrokerServices = brokerServices;
    config.sandboxPermissionsService = permissionsService;
#endif

#ifdef LIBFUZZER
    if (getenv("FUZZER"))
        gBootstrap->XRE_LibFuzzerSetDriver(fuzzer::FuzzerDriver);
#endif

    EnsureBrowserCommandlineSafe(argc, argv);

    return gBootstrap->XRE_main(argc, argv, config);
}

int main(int argc, char* argv[], char* envp[]) {
    // TODO: Is fork server important
    // TODO: Profiler logging
    // TODO: Content process
    // TODO: Has DLL Blocklist
    // TODO: Do we care about silent mode? What even is it?
    // TODO: XP_WIN High dpi support

    // We will likely only ever support this as a command line argument on Windows
    // and OSX, so we're ifdefing here just to not create any expectations.
#if defined(XP_WIN) || defined(XP_MACOSX)
    if (argc > 1 && IsArg(argv[1], "silentmode")) {
        ::putenv(const_cast<char*>("MOZ_APP_SILENT_START=1"));
#  if defined(XP_WIN)
        // On windows We also want to set a separate variable, which we want to
        // persist across restarts, which will let us keep the process alive
        // even if the last window is closed.
        ::putenv(const_cast<char*>("MOZ_APP_ALLOW_WINDOWLESS=1"));
#  endif
#  if defined(XP_MACOSX)
        ::putenv(const_cast<char*>("MOZ_APP_NO_DOCK=1"));
#  endif
    }
#endif

    nsresult rv = InitXPCOMGlue(LibLoadingStrategy::NoReadAhead);
    if (NS_FAILED(rv)) {
        Output("InitXPCOMGlue failed\n");
        return 255;
    }

    int result = runXPCShell(argc, argv, envp);

    gBootstrap->NS_LogTerm();

#ifdef XP_MACOSX
    // Allow writes again. While we would like to catch writes from static
    // destructors to allow early exits to use _exit, we know that there is
    // at least one such write that we don't control (see bug 826029). For
    // now we enable writes again and early exits will have to use exit instead
    // of _exit.
    gBootstrap->XRE_StopLateWriteChecks();
#endif

    gBootstrap.reset();
    return result;
}
