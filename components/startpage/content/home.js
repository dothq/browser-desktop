/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const time = document.getElementById("time");

const tick = () => {
	const d = new Date();

	time.textContent = `${d.getHours().toString().padStart(2, "0")}:${d
		.getMinutes()
		.toString()
		.padStart(2, "0")}`;
};

tick();
setInterval(() => tick(), 1000);
