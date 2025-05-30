export enum Sex {
    Male = 0,
    Female = 1,
}

export class User {
    constructor(public id:number=-1,public username:string="",public email:string="",
                public firstName:string="",public lastName:string="",public sex:Sex = Sex.Male,
                public address="",public postalCode="",public city:string="",public country:string=""){
    }
}

