// src/mocks/browser.ts
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

let workerInstance: ReturnType<typeof setupWorker> | null = null;
let workerStarted = false;

const getWorker = () => {
	if (!workerInstance) {
		workerInstance = setupWorker(...handlers);
	}
	return workerInstance;
};

export const startMockWorker = async () => {
	const worker = getWorker();
	if (workerStarted) {
		return worker;
	}

	await worker.start({ quiet: true });
	workerStarted = true;
	return worker;
};

export const stopMockWorker = async () => {
	if (workerInstance && workerStarted) {
		await workerInstance.stop();
		workerStarted = false;
	}
};

export const getMockWorker = () => getWorker();