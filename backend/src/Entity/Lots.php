<?php

namespace App\Entity;

use App\Repository\LotsRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource]
#[ORM\Entity(repositoryClass: LotsRepository::class)]
class Lots
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['produit:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['produit:read'])]
    private ?\DateTime $datePeremption = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['produit:read'])]
    private ?\DateTime $dateEntreeLot = null;

    #[ORM\ManyToOne(inversedBy: 'lots')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Produit $produit = null;
    
    #[ORM\Column(length: 255)]
    #[Groups(['produit:read'])] 
    private ?string $numeroLot = null;

   /**
     * @var Collection<int, Recu>
     */
    #[ORM\OneToMany(targetEntity: Recu::class, mappedBy: 'lot')]
    #[Groups(['produit:read'])] // <-- Indispensable ici
    private Collection $recus;

    #[ORM\Column(type: 'float')]
    #[Groups(['produit:read'])]
    private ?float $contenanceRestante = null;

    public function __construct()
    {
        $this->recus = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getDatePeremption(): ?\DateTime { return $this->datePeremption; }
    public function setDatePeremption(\DateTime $datePeremption): static { $this->datePeremption = $datePeremption; return $this; }

    public function getDateEntreeLot(): ?\DateTime { return $this->dateEntreeLot; }
    public function setDateEntreeLot(\DateTime $dateEntreeLot): static { $this->dateEntreeLot = $dateEntreeLot; return $this; }

    public function getProduit(): ?Produit { return $this->produit; }
    public function setProduit(?Produit $produit): static { $this->produit = $produit; return $this; }

    public function getRecus(): Collection { return $this->recus; }
    public function getContenanceRestante(): ?float
    {
        return $this->contenanceRestante;
    }

    public function setContenanceRestante(float $contenanceRestante): static
    {
        $this->contenanceRestante = $contenanceRestante;
        return $this;
    }
    public function getNumeroLot(): ?string
    {
        return $this->numeroLot;
    }
    public function setNumeroLot(string $numeroLot): static
    {
        $this->numeroLot = $numeroLot;
        return $this;
    }
}