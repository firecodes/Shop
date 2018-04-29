import { StationService } from 'user/services/stationService';
import { MobilePage } from 'components/mobilePage';

import * as site from 'site';
import * as React from 'react';

export default async function (page: chitu.Page) {

    let station = page.createService(StationService);
    let pageData = await station.fullPage(() => station.pages.categories());

    ReactDOM.render(<MobilePage pageData={pageData} elementPage={page} />, page.element);

}