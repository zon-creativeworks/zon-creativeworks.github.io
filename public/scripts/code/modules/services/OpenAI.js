"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class OpenAI {
    constructor() {
        this.FORMAT = 'http://localhost:3000/api/format';
        this.PROMPT = 'http://localhost:3000/api/prompt';
        this.DIARIZE = 'http://localhost:3000/api/diarize';
    }
    formatInput(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this.FORMAT}?t=${input}`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'text/data-stream; application/json',
                },
            });
            return response.text();
        });
    }
}
exports.default = OpenAI;
//# sourceMappingURL=OpenAI.js.map