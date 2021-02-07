import { Injectable } from '@nestjs/common';
import { Coffee } from 'src/entities/coffee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Flavor } from 'src/entities/flavor.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Event } from '../events/entities/event.entity';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly connection: Connection,
  ) {}

  async findAll(paginationDto: PaginationDto): Promise<Coffee[]> {
    const { limit, offset } = paginationDto;
    return await this.coffeeRepository.find({
      relations: ['flavors'],
      skip: limit,
      take: offset,
    });
  }

  async findOne(id: number): Promise<Coffee> {
    return await this.coffeeRepository.findOne(id, {
      relations: ['flavors'],
    });
  }

  async create(createCoffeeDto: CreateCoffeeDto): Promise<Coffee> {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map(async (flavor) => {
        return await this.preloadCoffeeFalvors(flavor);
      }),
    );
    console.log(flavors);
    const newCoffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavors,
    });

    await this.coffeeRepository.save(newCoffee);
    return newCoffee;
  }

  async update(id: number, updateCoffeeDto: UpdateCoffeeDto): Promise<Coffee> {
    const flavors = await (updateCoffeeDto.flavors &&
      Promise.all(
        updateCoffeeDto.flavors.map(async (flavor) => {
          return await this.preloadCoffeeFalvors(flavor);
        }),
      ));

    const coffeeToUpdate = await this.coffeeRepository.preload({
      id: id,
      ...updateCoffeeDto,
      flavors,
    });

    return await this.coffeeRepository.save(coffeeToUpdate);
  }

  async remove(id: number): Promise<string> {
    const coffeeToRemove = await this.coffeeRepository.findOne(id);
    await this.coffeeRepository.remove(coffeeToRemove);
    return 'Coffee removed successfully';
  }

  private async preloadCoffeeFalvors(name: string): Promise<Flavor> {
    const flavor = await this.flavorRepository.findOne({ name });
    if (flavor) {
      return flavor;
    }

    const returnVal = this.flavorRepository.create({ name });
    console.log(returnVal);
    return returnVal;
  }

  async recommendCoffee(coffee: Coffee): Promise<void> {
    const queryRunner = this.connection.createQueryRunner(); //Instantiating the queryRunner object
    await queryRunner.connect(); //connecting to the database using queryRunner
    await queryRunner.startTransaction(); //starting transactions

    // make sure put everything in try and catch block
    try {
      coffee.recomendations++;
      const event = new Event();
      event.name = 'coffee_event';
      event.type = 'coffee_recommendation';
      event.payload = { coffee_id: coffee.id };
      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(event);
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
