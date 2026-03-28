<?php

namespace App\Entity;

use App\Repository\RecuRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RecuRepository::class)]
class Recu
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $quantite = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTime $date_reception = null;

    #[ORM\ManyToOne(inversedBy: 'recus')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Commande $commande = null;

    #[ORM\ManyToOne(inversedBy: 'recus')]
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

    public function getDateReception(): ?\DateTime
    {
        return $this->date_reception;
    }

    public function setDateReception(\DateTime $date_reception): static
    {
        $this->date_reception = $date_reception;

        return $this;
    }

    public function getCommande(): ?Commande
    {
        return $this->commande;
    }

    public function setCommande(?Commande $commande): static
    {
        $this->commande = $commande;

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
