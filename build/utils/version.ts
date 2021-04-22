import axios from "axios";

export const getLatestFF = async () => {
    const { data } = await axios.get(
        `https://product-details.mozilla.org/1.0/firefox_history_major_releases.json`
    );

    return Object.keys(data)[
        Object.keys(data).length - 1
    ];
};
