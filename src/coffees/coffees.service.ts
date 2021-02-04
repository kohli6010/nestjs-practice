import { Injectable } from '@nestjs/common';
import { Coffee } from 'src/entities/coffee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
  ) {}

  async findAll(): Promise<Coffee[]> {
    return await this.coffeeRepository.find();
  }

  async findOne(id: number): Promise<Coffee> {
    return await this.coffeeRepository.findOne(id);
  }

  async create(createCoffeeDto: CreateCoffeeDto): Promise<Coffee> {
    const newCoffee = this.coffeeRepository.create(createCoffeeDto);
    await this.coffeeRepository.save(newCoffee);
    return newCoffee;
  }

  async update(id: number, updateCoffeeDto: UpdateCoffeeDto): Promise<Coffee> {
    const coffeeToUpdate = await this.coffeeRepository.preload({
      id: id,
      ...updateCoffeeDto,
    });

    return await this.coffeeRepository.save(coffeeToUpdate);
  }

  async remove(id: number): Promise<string> {
    const coffeeToRemove = await this.coffeeRepository.findOne(id);
    await this.coffeeRepository.remove(coffeeToRemove);
    return 'Coffee removed successfully';
  }
}
