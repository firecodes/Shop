import { Editor, EditorProps } from "user/components/editor";
import { State as ControlState, default as CategoriesControl } from 'user/components/image/control';

export interface EditorState extends Partial<ControlState> {
}

export default class ImageEditor extends Editor<EditorProps, EditorState> {
    constructor(props) {
        super(props);
        this.loadEditorCSS();
    }

    bindTextElement(e: HTMLInputElement, member: keyof EditorState) {
        if (!e) return;
        e.value = this.state.source;
        e.onchange = () => {
            this.state.source = e.value || "";
            this.setState(this.state);
        }
    }
    render() {
        return (
            <div className="image-editor form-horizontal">
                <div className="form-group">
                    <label className="col-sm-4">图片链接</label>
                    <div className="col-sm-8">
                        <div className="input-group">
                            <input className="form-control"
                                ref={(e: HTMLInputElement) => this.bindTextElement(e, "source")} />
                            <span className="input-group-btn">
                                <button className="btn btn-default" type="button">
                                    <i className="icon-plus" />
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label className="col-sm-4">页面链接</label>
                    <div className="col-sm-8">
                        <input className="form-control" />
                    </div>
                </div>
            </div>
        )
    }
}