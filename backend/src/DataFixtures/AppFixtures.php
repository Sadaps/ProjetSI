<?php

namespace App\DataFixtures;

use App\Entity\Categorie;
use App\Entity\Commande;
use App\Entity\Contact;
use App\Entity\Contenir;
use App\Entity\Fonction;
use App\Entity\Fournisseur;
use App\Entity\FournisPar;
use App\Entity\Produit;
use App\Entity\Lots;
use App\Entity\Inventaire;
use App\Entity\LigneInventaire;
use App\Entity\Recu;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('fr_FR');

        // --- 1. BASES (FONCTION & CATEGORIE) ---
        $fonctionCom = new Fonction();
        $fonctionCom->setLibelle('Responsable Commercial');
        $manager->persist($fonctionCom);

        $catCosmetique = new Categorie();
        $catCosmetique->setNom('Cosmétique')->setDenomination('C');
        $manager->persist($catCosmetique);

        // --- 2. FOURNISSEURS ET CONTACTS AVEC FAKER ---
        $fournisseursReferences = []; 

        for ($i = 0; $i < 5; $i++) {
            $fournisseur = new Fournisseur();
            
            // On coupe à 50 caractères max pour éviter l'erreur SQL
            $fournisseur->setNom(substr($faker->company(), 0, 50))
                        ->setTelephone(substr($faker->phoneNumber(), 0, 50))
                        ->setAdresse(substr($faker->address(), 0, 50));
                        
            $manager->persist($fournisseur);
            $fournisseursReferences[] = $fournisseur;

            $nombreDeContacts = $faker->numberBetween(1, 3);
            
            for ($k = 0; $k < $nombreDeContacts; $k++) {
                $contact = new Contact();
                $contact->setNom(substr($faker->lastName(), 0, 50))
                        ->setPrenom(substr($faker->firstName(), 0, 50))
                        ->setMail(substr($faker->companyEmail(), 0, 50)) 
                        ->setFonction($fonctionCom)
                        ->setFournisseur($fournisseur);
                        
                $manager->persist($contact);
            }
        }

        // --- 3. PRODUITS + LOTS ---
        $vraisProduitsData = [
            ['nom' => 'Huile d\'Amande Douce', 'sci' => 'Prunus Amygdalus Dulcis', 'fonc' => 'Émollient', 'unite' => 'ml'],
            ['nom' => 'Beurre de Karité', 'sci' => 'Butyrospermum Parkii', 'fonc' => 'Nourrissant', 'unite' => 'g'],
            ['nom' => 'Glycérine Végétale', 'sci' => 'Glycerin', 'fonc' => 'Humectant', 'unite' => 'ml'],
            ['nom' => 'Argile Verte', 'sci' => 'Montmorillonite', 'fonc' => 'Purifiant', 'unite' => 'g'],
            ['nom' => 'Charbon Actif', 'sci' => 'Activated Charcoal', 'fonc' => 'Détoxifiant', 'unite' => 'g'],
            ['nom' => 'Acide Hyaluronique', 'sci' => 'Sodium Hyaluronate', 'fonc' => 'Actif hydratant', 'unite' => 'g'], 
            ['nom' => 'Vitamine E', 'sci' => 'Tocopherol', 'fonc' => 'Antioxydant', 'unite' => 'ml'],
            ['nom' => 'Flacons Verre 50ml', 'sci' => 'Pkg-V50', 'fonc' => 'Conditionnement', 'unite' => 'unité'],
            ['nom' => 'Bouchons Pompe', 'sci' => 'Pkg-BP', 'fonc' => 'Conditionnement', 'unite' => 'unité'],
            ['nom' => 'Hydrolat de Rose', 'sci' => 'Rosa Damascena Water', 'fonc' => 'Apaisant', 'unite' => 'ml'],
        ];

        $produitsReferences = [];
        $lotsReferences = []; 

        foreach ($vraisProduitsData as $data) {
            $produit = new Produit();
            $produit->setNom($data['nom'])
                    ->setNomScientifique($data['sci'])
                    ->setFonction($data['fonc'])
                    ->setCosmos('Certifié COSMOS Organic')
                    ->setUnite($data['unite']); 
            
            if ($data['unite'] === 'g' || $data['unite'] === 'ml') {
                $produit->setQuantiteTotale((float)$faker->randomElement([1000, 2500, 5000, 10000]));
            } else {
                $produit->setQuantiteTotale((float)$faker->numberBetween(50, 500));
            }

            if (method_exists($produit, 'setCategorie')) {
                $produit->setCategorie($catCosmetique);
            }

            $manager->persist($produit);
            $produitsReferences[] = $produit;

            // --- LIAISON FOURNISSEURS ---
            $fournisseursAleatoires = $faker->randomElements($fournisseursReferences, 2);
            foreach ($fournisseursAleatoires as $fRef) {
                $fournisPar = new FournisPar();
                $fournisPar->setProduit($produit)
                           ->setFournisseur($fRef)
                           ->setPrix($faker->randomFloat(2, 5, 80)); 

                if ($data['unite'] === 'g' || $data['unite'] === 'ml') {
                    $fournisPar->setMOQ((float)$faker->randomElement([250, 500, 1000, 5000])); 
                } else {
                    $fournisPar->setMOQ((float)$faker->randomElement([50, 100, 200])); 
                }

                $fournisPar->setDelaiMin($faker->numberBetween(2, 5)); 
                $fournisPar->setDelaiMax($faker->numberBetween(6, 15));
                $manager->persist($fournisPar);
            }

            // --- LOTS PAR PRODUIT ---
            $nbLots = $faker->numberBetween(1, 3);
            for ($j = 0; $j < $nbLots; $j++) {
                $lot = new Lots();
                
                if ($data['unite'] === 'g' || $data['unite'] === 'ml') {
                    $quantiteLot = $faker->randomElement([250, 500, 1000, 2500, 5000]);
                } else {
                    $quantiteLot = $faker->numberBetween(50, 250);
                }

                $lot->setContenanceRestante((float)$quantiteLot)
                    ->setNumeroLot('LOT-' . $faker->numberBetween(1000, 9999)) 
                    ->setDatePeremption($faker->dateTimeBetween('+1 year', '+3 years'))
                    ->setDateEntreeLot($faker->dateTimeBetween('-1 month', 'now'))
                    ->setProduit($produit);
                
                $manager->persist($lot);
                $lotsReferences[] = $lot;
            }
        }

        // --- 4. 15 COMMANDES (Issues de ta branche) ---
        for ($i = 0; $i < 15; $i++) {
            $commande = new Commande();
            $commande->setDateCommande($faker->dateTimeBetween('-2 months', 'now'))
                     ->setPrix($faker->randomFloat(2, 150, 3500))
                     ->setFournisseur($faker->randomElement($fournisseursReferences))
                     ->setStatut($faker->randomElement(['En attente', 'En attente', 'Reçue', 'Annulée'])); 
            
            $manager->persist($commande);

            $nombreProduits = $faker->numberBetween(1, 4);
            shuffle($produitsReferences); 

            for ($j = 0; $j < $nombreProduits; $j++) {
                $prodSelect = $produitsReferences[$j];
                $unite = $prodSelect->getUnite();

                if ($unite === 'g' || $unite === 'ml') {
                    $quantiteAchetee = (float)$faker->randomElement([100, 250, 500, 1000, 2500, 5000]);
                } else {
                    $quantiteAchetee = (float)$faker->randomElement([50, 100, 200, 500]);
                }

                $contenir = new Contenir();
                $contenir->setCommande($commande)
                         ->setProduit($prodSelect) 
                         ->setQuantite($quantiteAchetee); 
                
                $manager->persist($contenir);
            }
        }

        // --- 5. INVENTAIRE (Issu de ton main) ---
        $inventaire = new Inventaire();
        $inventaire->setDateInv(new \DateTime());
        $manager->persist($inventaire);

        foreach ($lotsReferences as $lot) {
            $ligne = new LigneInventaire(); 
            $ligne->setInventaire($inventaire)
                  ->setNomProduit(substr($lot->getProduit()->getNom(), 0, 255)) 
                  ->setQuantite((float)($lot->getContenanceRestante() - 1)); 
            $manager->persist($ligne);
        }

        // --- 6. REÇU ---
        if (!empty($lotsReferences)) {
            $recu = new Recu();
            $recu->setCommande($commande) 
                 ->setLot($lotsReferences[0])
                 ->setQuantite(10)
                 ->setDateReception(new \DateTime());
            $manager->persist($recu);
        }

        $manager->flush();
    }
}