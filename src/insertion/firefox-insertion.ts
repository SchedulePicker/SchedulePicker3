import DOMPurify from 'dompurify';
import { assertExists } from '../util/assert';
import { isIframeElement, isInputElement, isTextareaElement } from '../util/type-check';
import { AbstractInsertion } from './abstract-insertion';

export class FirefoxInsertion extends AbstractInsertion {
    insertTextAtCaret(windowObj: Window, target: HTMLElement | null, text: string) {
        assertExists(target);

        if (isIframeElement(target)) {
            this.insertTextAtCaret(
                target.contentWindow!,
                target.contentDocument?.querySelector('.editable') ?? null,
                text,
            );
            return;
        }

        if (isTextareaElement(target) || isInputElement(target)) {
            const selectionStart = target.selectionStart;
            const selectionEnd = target.selectionEnd;
            assertExists(selectionStart);
            assertExists(selectionEnd);
            const startText = target.value.slice(0, selectionStart);
            const endText = target.value.slice(selectionEnd);
            target.value = startText + text + endText;

            // 挿入文字列の末尾にカーソルを移動させる
            target.focus();
            target.selectionEnd = selectionStart + text.length;

            // textarea に入力される文字列をリアルタイムで状態管理しているようなページだと、
            // 拡張機能側で textarea の value を変更しても change イベントが発火せず、再レンダリングしたときに
            // ページ側で管理している状態で TextArea が上書きされてしまうので、能動的に change イベントを発火させる。
            target.dispatchEvent(new window.Event('change', { bubbles: true }));
        } else if (target.getAttribute('g_editable')) {
            const selection = windowObj.getSelection();
            assertExists(selection);
            const range = selection.getRangeAt(0);
            range.deleteContents();

            const node = document.createElement('span');
            node.style.whiteSpace = 'pre';
            node.innerHTML = DOMPurify.sanitize(text);
            range.insertNode(node);

            // 挿入文字列の末尾にカーソルを移動させる
            target.focus();
            selection.collapseToEnd();
        } else {
            throw new Error('Unsupported input field.');
        }
    }
}
