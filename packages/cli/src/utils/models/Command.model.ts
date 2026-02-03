interface HelpProp {
    flag: string[]
    option: string[];
    description: string
}


export abstract class CommandModel {
    help({ }: HelpProp) {
        return
    }


}