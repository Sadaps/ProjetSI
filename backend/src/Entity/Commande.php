<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\CommandeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(normalizationContext: ['groups' => ['commande:read']],
    denormalizationContext: ['groups' => ['commande:write']])]
#[ORM\Entity(repositoryClass: CommandeRepository::class)]
class Commande
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['commande:read', 'commande:write'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['commande:read', 'commande:write'])]
    private ?\DateTime $date_commande = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 2)]
    #[Groups(['commande:read', 'commande:write'])]
    private ?string $prix = null;
    
    /** 
    *@var Collection<int, Contenir>
    */
    #[ORM\OneToMany(mappedBy: 'commande', targetEntity: Contenir::class, cascade: ['persist'])]
    #[Groups(['commande:read', 'commande:write'])]
    private Collection $contenir; 

    /**
     * @var Collection<int, Recu>
     */
    #[ORM\OneToMany(targetEntity: Recu::class, mappedBy: 'commande')]
    private Collection $recus;

    #[ORM\ManyToOne(inversedBy: 'commandes')]
    #[Groups(['commande:read', 'commande:write'])]
    private ?Fournisseur $fournisseur = null;

    #[ORM\Column(length: 50)]
    #[Groups(['commande:read', 'commande:write'])]
    private ?string $statut = null;

    public function __construct()
    {
        // Maintenant ces lignes ne feront plus d'erreur
        $this->contenir = new ArrayCollection();
        $this->recus = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getDateCommande(): ?\DateTime { return $this->date_commande; }
    public function setDateCommande(\DateTime $date_commande): static { $this->date_commande = $date_commande; return $this; }

    public function getPrix(): ?string { return $this->prix; }
    public function setPrix(string $prix): static { $this->prix = $prix; return $this; }

    /**
     * @return Collection<int, Contenir>
     */
    public function getContenir(): Collection { return $this->contenir; }

    public function addContenir(Contenir $contenir): static
    {
        if (!$this->contenir->contains($contenir)) {
            $this->contenir->add($contenir);
            $contenir->setCommande($this);
        }
        return $this;
    }

    public function removeContenir(Contenir $contenir): static
    {
        if ($this->contenir->removeElement($contenir)) {
            if ($contenir->getCommande() === $this) {
                $contenir->setCommande(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Recu>
     */
    public function getRecus(): Collection { return $this->recus; }

    public function addRecu(Recu $recu): static
    {
        if (!$this->recus->contains($recu)) {
            $this->recus->add($recu);
            $recu->setCommande($this);
        }
        return $this;
    }

    public function removeRecu(Recu $recu): static
    {
        if ($this->recus->removeElement($recu)) {
            if ($recu->getCommande() === $this) {
                $recu->setCommande(null);
            }
        }
        return $this;
    }

    public function getFournisseur(): ?Fournisseur { return $this->fournisseur; }
    public function setFournisseur(?Fournisseur $fournisseur): static { $this->fournisseur = $fournisseur; return $this; }

    public function getStatut(): ?string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): static
    {
        $this->statut = $statut;

        return $this;
    }
}