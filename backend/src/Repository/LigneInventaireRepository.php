<?php

namespace App\Repository;

use App\Entity\LigneInventaire;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LigneInventaire>
 *
 * @method LigneInventaire|null find($id, $lockMode = null, $lockVersion = null)
 * @method LigneInventaire|null findOneBy(array $criteria, array $orderBy = null)
 * @method LigneInventaire[]    findAll()
 * @method LigneInventaire[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class LigneInventaireRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LigneInventaire::class);
    }

}