<?php

namespace App\Entity;

use App\Repository\VerifierLotRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: VerifierLotRepository::class)]
class VerifierLot
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $quantite = null;

    #[ORM\ManyToOne(inversedBy: 'verifierLot')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Inventaire $inventaire = null;

    #[ORM\ManyToOne(inversedBy: 'verifierLot')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Lots $lot = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getQuantite(): ?int
    {
        return $this->quantite;
    }

    public function setQuantite(int $quantite): static
    {
        $this->quantite = $quantite;

        return $this;
    }

    public function getInventaire(): ?Inventaire
    {
        return $this->inventaire;
    }

    public function setInventaire(?Inventaire $inventaire): static
    {
        $this->inventaire = $inventaire;

        return $this;
    }

    public function getLot(): ?Lots
    {
        return $this->lot;
    }

    public function setLot(?Lots $lot): static
    {
        $this->lot = $lot;

        return $this;
    }
}
