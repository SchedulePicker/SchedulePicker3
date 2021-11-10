import { Factory } from '../utils/factory';
import { SyntaxGenerator } from './base/abstract-syntax-generator';
import { HtmlSyntaxGenerator } from './html-syntax-generator';
import { MarkdownSyntaxGenerator } from './markdown-syntax-generator';
import { Syntax } from './syntax';

export class SyntaxGeneratorFactory implements Factory<Syntax, SyntaxGenerator> {
    create(syntax: Syntax): SyntaxGenerator {
        switch (syntax) {
            case 'html':
                return new HtmlSyntaxGenerator();
            case 'markdown':
                return new MarkdownSyntaxGenerator();
            default:
                throw new Error('Syntax is not implemented.');
        }
    }
}
