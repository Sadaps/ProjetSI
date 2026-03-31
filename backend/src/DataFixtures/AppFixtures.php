<?php

namespace App\DataFixtures;

use App\Entity\Produit;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // On initialise Faker en français
        $faker = Factory::create('fr_FR');

        // 1. Quelques vrais exemples pour faire plus pro
        $vraisProduits = [
            ['nom' => 'Huile d\'Amande Douce', 'sci' => 'Prunus Amygdalus Dulcis Oil', 'fonc' => 'Émollient'],
            ['nom' => 'Beurre de Karité', 'sci' => 'Butyrospermum Parkii Butter', 'fonc' => 'Nourrissant'],
            ['nom' => 'Acide Hyaluronique', 'sci' => 'Sodium Hyaluronate', 'fonc' => 'Actif hydratant'],
        ];

        foreach ($vraisProduits as $data) {
            $produit = new Produit();
            $produit->setNom($data['nom'])
                    ->setNomScientifique($data['sci'])
                    ->setFonction($data['fonc'])
                    ->setCosmos('Certifié COSMOS Organic');
            
            $manager->persist($produit);
        }

        // 2. On génère 15 produits complètement aléatoires pour remplir la liste
        for ($i = 0; $i < 15; $i++) {
            $produit = new Produit();
            $produit->setNom(ucfirst($faker->word())) // Un mot au hasard avec une majuscule
                    ->setNomScientifique(ucfirst($faker->word()) . ' ' . $faker->word()) // Deux mots
                    ->setFonction($faker->randomElement(['Conservateur', 'Solvant', 'Parfum', 'Tensioactif']))
                    ->setCosmos($faker->boolean(70) ? 'Conforme COSMOS' : null); // 70% de chance d'avoir la mention

            $manager->persist($produit);
        }

        // On envoie tout dans la base de données
        $manager->flush();
    }
}