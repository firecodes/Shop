import { MobilePageDesigner } from 'mobilePageDesigner';
import { StationService as AdminStation } from 'adminServices/station';
import { StationService as UserStation } from 'userServices/stationService';

export default function (page: chitu.Page) {
    let adminStation = page.createService(AdminStation);
    let userStation = page.createService(UserStation);

    userStation.pages.menu().then(pageData => {
        ReactDOM.render(
            <MobilePageDesigner pageData={pageData}
                save={(p) => adminStation.savePageData(p)} userStation={userStation}>
            </MobilePageDesigner>, page.element);
    })
}
