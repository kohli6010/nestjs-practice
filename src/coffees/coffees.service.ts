import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from 'src/entities/coffee.entity';

@Injectable()
export class CoffeesService {
  private coffees: Coffee[] = [];
  findAll(): Coffee[] {
    return this.coffees;
  }

  findOne(id: string): Coffee {
    const convertedId: number = <number>new Number(id);
    console.log(convertedId.valueOf());
    const coffees: Coffee[] = this.coffees.filter((coffee) => {
      if (coffee.id == convertedId.valueOf()) {
        return coffee;
      }
    });
    if (coffees.length <= 0) {
      throw new NotFoundException('Nothing found with this id');
    }
    return coffees[0];
  }

  create(coffee): string {
    this.coffees.push(coffee);
    return 'New coffee created';
  }

  update(id: string, body): string {
    const convertedId = <number>new Number(id);
    this.coffees.map((coffee) => {
      if (coffee.id == convertedId) {
        coffee[Object.keys(body)[0]] = body[Object.keys(body)[0]];
        return;
      }
    });
    console.log(this.coffees);
    return 'Successfully Updated the requried field';
  }
}
