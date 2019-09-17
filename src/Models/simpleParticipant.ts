export default class Simpleparticipant {
  public id: number;
  public alias: string;
  public paid: number;
  public hasToPay: number = -1;
  public hasToGet: number = -1;

  constructor(id: number, alias: string, paid: number) {
    this.id = id;
    this.alias = alias;
    this.paid = paid;
  }

  public updateValues(amountPerParticipant: number) {
    if (amountPerParticipant > this.paid) {
      this.hasToPay = amountPerParticipant - this.paid;
      this.hasToGet = 0;
    } else {
      this.hasToGet = this.paid - amountPerParticipant;
      this.hasToPay = 0;
    }
  }
}
