import { Editor, EditorProps } from 'mobileComponents/editor';
import { Props as ControlProps, State as ControlState, default as Control } from 'mobileComponents/member/control';
let h = React.createElement;
export interface EditorState {

}

export default class MemberEditor extends Editor<ControlProps, ControlState, EditorState, Control> {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div></div>
        );
    }
}