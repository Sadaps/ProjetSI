<?php

namespace App\Entity;


use App\Repository\ProduitRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use Symfony\Component\Serializer\Attribute\Groups;
#[ApiResource(
    normalizationContext: ['groups' => ['produit:read', 'contenir:read', 'commande:read']]
)]
#[ORM\Entity(repositoryClass: ProduitRepository::class)]
class Produit
{

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['produit:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Groups(['produit:read', 'contenir:read', 'commande:read'])]
    private ?string $nom = null;

    #[ORM\Column(length: 50)]
    #[Groups(['produit:read', 'contenir:read', 'commande:read'])]
    private ?string $nomScientifique = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['produit:read'])]
    private ?string $fonction = null;

    #[ORM\Column(length: 150, nullable: true)]
    #[Groups(['produit:read'])]
    private ?string $cosmos = null;

    /**
     * @var Collection<int, FournisPar>
     */
    #[ORM\OneToMany(targetEntity: FournisPar::class, mappedBy: 'produit')]
    private Collection $fournisPar;

    /**
     * @var Collection<int, Lots>
     */
    #[ORM\OneToMany(targetEntity: Lots::class, mappedBy: 'produit')]
    #[Groups(['produit:read'])]
    private Collection $lots;

    /**
     * @var Collection<int, Contenir>
     */
    #[ORM\OneToMany(targetEntity: Contenir::class, mappedBy: 'produit')]
    private Collection $contenir;

    public function __construct()
    {
        $this->fournisPar = new ArrayCollection();
        $this->lots = new ArrayCollection();
        $this->contenir = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getNomScientifique(): ?string
    {
        return $this->nomScientifique;
    }

    public function setNomScientifique(string $nomScientifique): static
    {
        $this->nomScientifique = $nomScientifique;

        return $this;
    }

    public function getFonction(): ?string
    {
        return $this->fonction;
    }

    public function setFonction(?string $fonction): static
    {
        $this->fonction = $fonction;

        return $this;
    }

    public function getCosmos(): ?string
    {
        return $this->cosmos;
    }

    public function setCosmos(?string $cosmos): static
    {
        $this->cosmos = $cosmos;

        return $this;
    }

    /**
     * @return Collection<int, FournisPar>
     */
    public function getFournisPar(): Collection
    {
        return $this->fournisPar;
    }

    public function addFournisPar(FournisPar $fournisPar): static
    {
        if (!$this->fournisPar->contains($fournisPar)) {
            $this->fournisPar->add($fournisPar);
            $fournisPar->setProduit($this);
        }

        return $this;
    }

    public function removeFournisPar(FournisPar $fournisPar): static
    {
        if ($this->fournisPar->removeElement($fournisPar)) {
            // set the owning side to null (unless already changed)
            if ($fournisPar->getProduit() === $this) {
                $fournisPar->setProduit(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Lots>
     */
    public function getLots(): Collection
    {
        return $this->lots;
    }

    public function addLot(Lots $lot): static
    {
        if (!$this->lots->contains($lot)) {
            $this->lots->add($lot);
            $lot->setProduit($this);
        }

        return $this;
    }

    public function removeLot(Lots $lot): static
    {
        if ($this->lots->removeElement($lot)) {
            // set the owning side to null (unless already changed)
            if ($lot->getProduit() === $this) {
                $lot->setProduit(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Contenir>
     */
    public function getContenir(): Collection
    {
        return $this->contenir;
    }

    public function addContenir(Contenir $contenir): static
    {
        if (!$this->contenir->contains($contenir)) {
            $this->contenir->add($contenir);
            $contenir->setProduit($this);
        }

        return $this;
    }

    public function removeContenir(Contenir $contenir): static
    {
        if ($this->contenir->removeElement($contenir)) {
            // set the owning side to null (unless already changed)
            if ($contenir->getProduit() === $this) {
                $contenir->setProduit(null);
            }
        }

        return $this;
    }

}
