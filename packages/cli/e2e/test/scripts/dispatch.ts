class DispatchCommand {
    execute() {
        const argv = process.argv;
        console.log('argv', argv)
    }
}

new DispatchCommand().execute();