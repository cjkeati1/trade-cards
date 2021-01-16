// Jest redirects to here if the real natsWrapper gets called in a testing environment

export const natsWrapper = {
    client: {
        publish: jest
            .fn()
            .mockImplementation(
                (subject: string, data: string, callback: () => void) => {
                    callback();
                }
            )
    }
};
