import axios from "axios";

export const getJson = async (URL, params = {} ) => {
    const { data } = await axios.get( URL, {
        params,
        timeout: Number(process.env.SENADO_API_TIMEOUT || 10000),
        headers: {
            Accept: "applicatio/json",
            "User-Agent": 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/37.0.2062.94 Chrome/37.0.2062.94 Safari/537.36'
        }
    })

    return data;
}