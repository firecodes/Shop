import { Editor, EditorProps } from 'mobileComponents/editor'
import { default as station, PageData } from 'services/Station';
import FormValidator from 'formValidator';
import { MobilePage as Page } from 'modules/Station/Components/MobilePage';
let controlsPath = 'mobile/controls'
let modules = [];
modules.push(
    'scripts/hammer', 'scripts/bezier-easing', `${controlsPath}/common`,
    `${controlsPath}/button`, `${controlsPath}/dataList`, `${controlsPath}/dialog`, `${controlsPath}/htmlView`,
    `${controlsPath}/imageBox`, `${controlsPath}/indicators`, `${controlsPath}/page`, `${controlsPath}/panel`,
    `${controlsPath}/tabs`
);
requirejs(modules);
requirejs(['css!content/devices.css'])
export default async function (page: chitu.Page) {
    requirejs([`css!${page.routeData.actionPath}.css`]);

    let { pageId, templateId } = page.routeData.values;
    let pageData = {} as PageData;
    if (pageId)
        pageData = await station.pageData(pageId);
    else if (templateId)
        pageData = await station.pageDataByTemplate(templateId);

    let h = React.createElement;
    ReactDOM.render(
        <div className="mobile">
            <Page />
        </div>,
        page.element
    );
}