<?php

namespace App\Entity;

use App\Repository\VerifierLotRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource]
#[ORM\Entity(repositoryClass: VerifierLotRepository::class)]
class VerifierLot
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['produit:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['produit:read'])]
    private ?int $quantite = null;

    #[ORM\ManyToOne(inversedBy: 'verifierLot')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['produit:read'])]
    private ?Inventaire $inventaire = null;

    #[ORM\ManyToOne(inversedBy: 'verifierLot')]
    #[ORM\JoinColumn(nullable: false)]
    /**
     * SURTOUT PAS de Groups ici.
     * C'est ce qui empêche VerifierLot de renvoyer vers Lot.
     */
    private ?Lots $lot = null;

    public function getId(): ?int { return $this->id; }

    public function getQuantite(): ?int { return $this->quantite; }
    public function setQuantite(int $quantite): static { $this->quantite = $quantite; return $this; }

    public function getInventaire(): ?Inventaire { return $this->inventaire; }
    public function setInventaire(?Inventaire $inventaire): static { $this->inventaire = $inventaire; return $this; }

    public function getLot(): ?Lots { return $this->lot; }
    public function setLot(?Lots $lot): static { $this->lot = $lot; return $this; }
}