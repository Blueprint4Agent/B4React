import countries from "../data/countryRegions.json";

const koreanRegions: Record<string, string> = {
    "11": "서울특별시",
    "26": "부산광역시",
    "27": "대구광역시",
    "28": "인천광역시",
    "29": "광주광역시",
    "30": "대전광역시",
    "31": "울산광역시",
    "41": "경기도",
    "42": "강원특별자치도",
    "43": "충청북도",
    "44": "충청남도",
    "45": "전북특별자치도",
    "46": "전라남도",
    "47": "경상북도",
    "48": "경상남도",
    "49": "제주특별자치도",
    "50": "세종특별자치시",
};
export function profileLocationOptions(language: string, country: string) {
    const names = new Intl.DisplayNames([language], { type: "region" });
    const countryItems = countries
        .map((item) => ({ id: item.code, label: names.of(item.code) ?? item.code }))
        .sort((a, b) => a.label.localeCompare(b.label, language));
    const regionItems = (countries.find((item) => item.code === country)?.regions ?? [])
        .map((region) => ({
            id: `${country}:${region.code}`,
            label:
                language.startsWith("ko") && country === "KR"
                    ? (koreanRegions[region.code] ?? region.name)
                    : region.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, language));
    return { countryItems, regionItems };
}
export function profileLocationLabel(
    value: string | null | undefined,
    language: string,
): string | null {
    if (!value) return null;
    const country = value.split(":")[0];
    const options = profileLocationOptions(language, country);
    const region = options.regionItems.find((item) => item.id === value);
    return region
        ? `${region.label}, ${options.countryItems.find((item) => item.id === country)?.label ?? country}`
        : null;
}
