import { Editor, EditorProps } from 'mobileComponents/editor';
import { Props as ControlProps, State as ControlState, default as Control } from 'mobile/components/noticeHeader/control'

interface EditorState {

}
export default class MyEditor extends Editor<ControlProps, ControlState, EditorState, Control> {
    constructor(props) {
        super(props)
    }

    render() {
        return (<div>SummaryHeader Editor</div>);
    }
} 