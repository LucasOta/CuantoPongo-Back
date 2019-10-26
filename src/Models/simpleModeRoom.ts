import SimpleParticipant from './simpleParticipant';

export default class SimpleModeRoom {
  auxParticipantId: number = 0;
  id: string;
  name: string = '';
  total: number;
  participants: SimpleParticipant[];

  constructor(id: string) {
    this.id = id;
    this.total = 0;
    this.participants = [];
  }

  public setName(pName: string) {
    this.name = pName;
  }

  private updateTotal() {
    let aux = 0;
    this.participants.forEach(function(part) {
      aux += part.paid;
    });

    this.total = aux;
  }

  // Participants

  public addParticipant(alias: string, paid: number) {
    let participant = new SimpleParticipant(
      this.auxParticipantId++,
      alias,
      paid
    );
    this.participants.push(participant);

    this.updateTotal();
    this.updateParticipants();
  }

  public modParticipant(id: number, alias: string, paid: number) {
    let aux = this.participants.findIndex(existeId);
    function existeId(element: any) {
      return element.id == id;
    }

    if (aux != -1) {
      this.participants[aux].alias = alias;
      this.participants[aux].paid = paid;
    }

    this.updateTotal();
    this.updateParticipants();
  }

  public delParticipant(id: number) {
    this.participants = this.participants.filter(function(value, index, arr) {
      return value.id != id;
    });

    this.updateTotal();
    this.updateParticipants();
  }

  private updateParticipants() {
    let ammountPerParticipant = this.total / this.participants.length;

    this.participants.forEach(function(part) {
      part.updateValues(ammountPerParticipant);
    });
  }
}
