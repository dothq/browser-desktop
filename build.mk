# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

package:
	@$(MAKE) -C dot/installer

recurse_pre-export:
	$(topsrcdir)/mach python $(topsrcdir)/dot/scripts/sync_integrity.py

recurse_compile:
	$(topsrcdir)/mach npm install --prefix=$(topsrcdir)/dot
	$(topsrcdir)/mach node $(topsrcdir)/dot/build/scripts/gen_js_module_types.js
	$(topsrcdir)/mach node $(topsrcdir)/dot/build/scripts/typecheck.js