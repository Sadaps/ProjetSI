<?php

namespace App\Entity;

use App\Repository\ContactRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource]
#[ORM\Entity(repositoryClass: ContactRepository::class)]
class Contact
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['fournisseur:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Groups(['fournisseur:read'])]
    private ?string $nom = null;

    #[ORM\Column(length: 50)]
    #[Groups(['fournisseur:read'])]
    private ?string $prenom = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['fournisseur:read'])]
    private ?string $telephone = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['fournisseur:read'])]
    private ?string $mail = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['fournisseur:read'])]
    private ?string $statut = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(['fournisseur:read'])]
    private ?\DateTime $date_maj = null;

    #[ORM\ManyToOne(inversedBy: 'contact')]
    #[Groups(['fournisseur:read'])]
    private ?Fonction $fonction = null;

    #[ORM\ManyToOne(inversedBy: 'contact')]
    #[ORM\JoinColumn(nullable: false)]
    /** * ON NE MET PAS de Groups ici. 
     * C'est ce qui empêche Contact de re-sérialiser Fournisseur.
     */
    private ?Fournisseur $fournisseur = null;

    public function getId(): ?int { return $this->id; }

    public function getNom(): ?string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = $nom; return $this; }

    public function getPrenom(): ?string { return $this->prenom; }
    public function setPrenom(string $prenom): static { $this->prenom = $prenom; return $this; }

    public function getTelephone(): ?string { return $this->telephone; }
    public function setTelephone(?string $telephone): static { $this->telephone = $telephone; return $this; }

    public function getMail(): ?string { return $this->mail; }
    public function setMail(?string $mail): static { $this->mail = $mail; return $this; }

    public function getStatut(): ?string { return $this->statut; }
    public function setStatut(?string $statut): static { $this->statut = $statut; return $this; }

    public function getDateMaj(): ?\DateTime { return $this->date_maj; }
    public function setDateMaj(?\DateTime $date_maj): static { $this->date_maj = $date_maj; return $this; }

    public function getFonction(): ?Fonction { return $this->fonction; }
    public function setFonction(?Fonction $fonction): static { $this->fonction = $fonction; return $this; }

    public function getFournisseur(): ?Fournisseur { return $this->fournisseur; }
    public function setFournisseur(?Fournisseur $fournisseur): static { $this->fournisseur = $fournisseur; return $this; }
}