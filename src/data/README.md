# Country and region snapshot

countryRegions.json derives from country-regions/country-region-data at commit `e65e124da5e846a833eba68e228b6d50aad42817`:
https://github.com/country-regions/country-region-data/blob/e65e124da5e846a833eba68e228b6d50aad42817/data.json

MIT license is retained in countryRegions.LICENSE.txt. All 249 country entries and
4,387 subdivisions are retained. Missing region short codes use a deterministic
`x-` + first 12 SHA-256 hex characters of the source region name; these are internal
IDs, not ISO codes. IDs persist as `country:region` in the optional location field.
Country names use Intl.DisplayNames; Korean subdivision labels have a small native
mapping in profileLocation.ts. Other regions use source names. This is a pinned
subdivision catalog, not every city or an automatically updated geolocation service.

The backend validates the same ID pairs with app/models/profile_location_codes.json.
Update both snapshots explicitly when adopting a newer source; do not regenerate
child data from a parent as part of builds/checks.
